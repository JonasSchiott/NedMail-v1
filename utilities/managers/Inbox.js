const Mail = require("./Mail");
const Sender = require("./Sender");
const { MESSAGES, COLORS, THREAD_STATUS } = require("@utils/Constants");
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
    this.content = this.formatContent(message);
    this.dbContent = {
      string: this.content,
      content: message.content,
      attachments: message.attachments.map((x) => x.url),
      createdAt: message.createdAt
    };
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
    } else if (thread) {
      retry = true;
      thread.state = THREAD_STATUS.CLOSED;
      thread.channelID = null;
    }

    const threads = this.guild.settings.mail.threads.filter((x) => x.id !== thread.id);
    const update = await this.guild.settings.update("mail.threads", [...threads, thread], {
      action: "overwrite",
      force: true
    });

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
        messages: []
      };
      await this.sender.sendReceived();
      await this.guild.settings.update("mail.threads", thread, { action: "add" });
      return this.findOpenThread(thread.id);
    }
  }

  async createThreadChannel(tries = 1) {
    if (tries > 3) {
      return this.sender.sendRetryOverload();
    }

    try {
      const mailID = this.nextMailID;
      const channel = await this.inbox.channels.create(cleanName(this.user.tag), {
        topic: `Mail thread created for **${this.user.tag}** with reference ID **${mailID}**.`,
        parent: this.pendingParent,
        reason: `Created new mail thread for ${this.user.tag}.`
      });
      await channel.send(this.generateHeader(mailID));
      this.guild.settings.update("mail.id", mailID);
      return channel;
    } catch (e) {
      this.client.console.error(e);
      return await this.createThreadChannel(++tries);
    }
  }

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
