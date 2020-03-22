const Mail = require("./Mail");
const Sender = require("./Sender");
const { THREAD_STATUS, CHANNELS, ROLES } = require("@utils/Constants");
const { cleanName } = require("@utils/Functions");
const { TextChannel } = require("discord.js");
const { KlasaUser, KlasaMessage, Timestamp } = require("klasa");

module.exports = class Inbox extends Mail {
  /**
   * @param {KlasaUser} user
   * @param {KlasaMessage} message
   */
  constructor(user, message) {
    super(user.client, user);
    this.sender = new Sender(user);
    if (message) {
      this.content = this.formatContent(message);
      this.dbContent = {
        string: this.content,
        content: message.content,
        attachments: message.attachments.map((x) => x.url),
        createdAt: message.createdAt
      };
    }
  }

  /**
   * Manages an incoming message
   * @param {string} content
   */
  async receive(content = this.dbContent, tries = 1) {
    if (tries > 3) {
      return this.sender.sendRetryOverload();
    }

    let thread = this.findOpenThread(this.user.id);
    if (!thread.id) {
      thread = await this.createThread();
    }

    const threadChannel = this.findOpenThreadChannel(thread ? thread.id : null);
    let retry = false;

    if (threadChannel) {
      await this.send(content.string, threadChannel, thread.alerts);
      thread.messages.push(content);
      thread.read = false;
    } else if (thread) {
      retry = true;
      thread.state = THREAD_STATUS.CLOSED;
      thread.read = true;
      thread.channelID = null;
    }

    thread.alerts = [];

    const update = await this.save(thread);

    if (retry) {
      return await this.receive(content, ++tries);
    }

    return update;
  }

  /**
   *
   * @param {string} content
   * @param {TextChannel} threadChannel
   */
  async send(content, threadChannel, alerts = []) {
    return await threadChannel.send({
      embed: this.generateMessage(this.user, content),
      content: alerts.map((x) => `<@${x}>`).join(", ")
    });
  }

  /**
   * Posts a message the thread user edits
   * @param {object} thread
   * @param {any} content
   */
  async edit(thread, content = this.dbContent.string) {
    const threadChannel = this.findOpenThreadChannel(this.user.id);
    if (threadChannel) {
      threadChannel.send(this.generateMessage(this.user, content, false, true));
      thread.messages.push(content);
      thread.edited = true;
      return await this.save(thread);
    }
  }

  async createThread(forced) {
    const threadChannel = await this.createThreadChannel(0, forced);
    if (threadChannel) {
      const thread = {
        id: this.nextMailID,
        state: THREAD_STATUS.OPEN,
        user: this.user.id,
        channelID: threadChannel.id,
        alerts: [],
        edited: false,
        read: false,
        createdAt: new Date(),
        messages: []
      };

      if (!forced) {
        await this.sender.sendReceived();
      }

      await this.guild.settings.update("mail.threads", thread, { action: "add" });
      return this.findOpenThread(thread.id);
    }
  }

  /**
   * Closes a mail thread
   * @param {string} channel
   */
  async close(channel) {
    const thread = this.findOpenThread(channel);

    if (thread) {
      thread.state = THREAD_STATUS.CLOSED;
      thread.channelID = null;
      thread.read = true;
      return await this.save(thread);
    }
  }

  async alert(thread, user, remove) {
    if (remove || thread.alerts.includes(user)) {
      thread.alerts = thread.alerts.filter((x) => x !== user);
    } else {
      thread.alerts.push(user);
    }

    await this.save(thread);
    return thread.alerts.includes(user);
  }

  async createThreadChannel(tries = 1, forced) {
    if (tries > 3) {
      return this.sender.sendRetryOverload();
    }

    const mailID = this.nextMailID;
    const channel = await this.inbox.channels
      .create(cleanName(this.user.tag), {
        topic: `Mail thread created for **${this.user.tag}** with reference ID **${mailID}**.`,
        parent: this.pendingParent,
        reason: `Created new mail thread for ${this.user.tag}.`
      })
      .then((x) => x.setPosition(0))
      .catch(() => {});

    if (!channel) {
      return await this.createThreadChannel(++tries);
    }

    await channel.send({
      embed: this.generateHeader(mailID),
      content: !forced ? `<@&${ROLES.RESPONDER}>` : "",
      disableMentions: "none"
    });
    this.guild.settings.update("mail.id", mailID);
    return channel;
  }

  /**
   * Cancels a scheduled mail thread close
   * @param {string} user
   */
  async cancelClose(user = this.user.id, warn) {
    const threadChannel = this.findOpenThreadChannel(user);
    if (warn) {
      threadChannel.send("Scheduled close has been cancelled.");
    }
    return await this.client.schedule.delete(user).catch(() => {});
  }

  /**
   * Marks a mail thread as read
   * @param {object} thread
   * @param {TextChannel} threadChannel
   */
  async markread(thread, threadChannel) {
    thread.read = true;
    if (threadChannel.parent.id !== CHANNELS.AWAITING_PARENT) {
      threadChannel.setParent(CHANNELS.AWAITING_PARENT).catch(() => {});
    }
    return await this.save(thread);
  }

  /**
   * Generate a mail thread header
   * @param {number} id Mail ID
   */
  generateHeader(id) {
    const member = this.guild.members.cache.get(this.user.id);
    const logs = this.findAllUserThreads(this.user.id);

    return new this.client.Embed()
      .setTitle(`Thread information [Ref: ${id}]`)
      .setThumbnail(this.client.user.displayAvatarURL())
      .setDescription(
        [
          `**Username:** ${this.user.tag}`,
          `**ID:** ${this.user.id}`,
          `**Registered:** ${new Timestamp("L").display(this.user.createdAt)}`,
          `**Join age:** ${member ? new Timestamp("L").display(member.joinedAt) : "Unknown"}`,
          logs.length
            ? [
                "─────────────",
                `${this.user.username} has \`${logs.length}\` log${logs.length > 1 ? "s" : ""}`,
                `Use \`${this.client.options.prefix}logs\` to view ${logs.length > 1 ? "them" : "it"}`
              ].join("\n")
            : ""
        ].join("\n")
      );
  }
};
