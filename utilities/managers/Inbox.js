const Mail = require("./Mail");
const Sender = require("./Sender");
const { MESSAGES, COLORS, THREAD_STATUS, CHANNELS } = require("@utils/Constants");
const { cleanName } = require("@utils/Functions");
const { TextChannel } = require("discord.js");
const { KlasaUser, KlasaMessage } = require("klasa");
const moment = require("moment");

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
   * Manages the incoming message
   * @param {string} content
   */
  async receive(content = this.dbContent, tries = 1) {
    if (tries > 3) {
      return this.sender.sendRetryOverload();
    }

    const thread = this.findOpenThread(this.user.id) || (await this.createThread());
    const threadChannel = this.findOpenThreadChannel(thread ? thread.id : null);
    let retry = false;

    if (threadChannel) {
      await this.send(content.string, threadChannel);
      thread.messages.push(content);
      thread.read = false;
    } else if (thread) {
      retry = true;
      thread.state = THREAD_STATUS.CLOSED;
      thread.read = true;
      thread.channelID = null;
    }

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
  async send(content, threadChannel) {
    return await threadChannel.send(this.generateMessage(this.user, content));
  }

  async createThread() {
    const threadChannel = await this.createThreadChannel();
    if (threadChannel) {
      const thread = {
        id: this.nextMailID,
        state: THREAD_STATUS.OPEN,
        user: this.user.id,
        channelID: threadChannel.id,
        read: false,
        messages: []
      };
      await this.sender.sendReceived();
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

  async createThreadChannel(tries = 1) {
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
      .catch(() => {});

    if (!channel) {
      return await this.createThreadChannel(++tries);
    }

    await channel.send(this.generateHeader(mailID));
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
          `**Registered:** ${moment(this.user.createdAt).format("L")}`,
          `**Join age:** ${member ? moment(member.joinedAt).format("L") : "Unknown"}`,
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
