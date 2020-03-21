const { GUILDS, CHANNELS, ROLES, COLORS, MESSAGES, THREAD_STATUS } = require("@utils/Constants");
const { KlasaClient, KlasaUser, KlasaMessage } = require("klasa");
const { GuildMember, Util } = require("discord.js");

module.exports = class Mail {
  /**
   * Client that manages mail
   * @param {KlasaClient} client
   * @param {KlasaUser} user
   */
  constructor(client, user) {
    this.client = client;
    this.user = user;
    this.guild = client.guilds.cache.get(GUILDS.MAIN);
    this.inbox = client.guilds.cache.get(GUILDS.INBOX);
    this.member = this.guild.members.cache.get(user.id);
  }
  /**
   * @param {GuildMember} member
   * @returns {boolean} Whether the member has permission to respond to mail
   */
  isResponder(user = this.user) {
    const member = this.inbox.members.cache.get(user.id);
    const responder = this.guild.settings.mail.responders.includes(user.id);
    return responder || (this.responderRole && member && member.roles.cache.has(this.responderRole.id));
  }

  /**
   * @param {GuildMember} member
   * @returns Whether the member is blocked from sending mail
   */
  isBlocked(user = this.user) {
    return user.settings.blocked;
  }

  /**
   * Generates a mail message
   * @param {KlasaUser} sender
   * @param {string} content
   * @param {string} color
   */
  generateMessage(sender, content, color = COLORS.MAIN) {
    const head = sender.id === this.client.user.id ? sender : `${sender} - ${sender.tag}`;
    const embed = new this.client.Embed()
      .setColor(color)
      .setTimestamp(null)
      .setThumbnail(sender.displayAvatarURL())
      .setDescription([head, "─────────────", content].join("\n"));

    return embed;
  }

  /**
   * Formats a message with the content and attachments
   * @param {KlasaMessage} message
   */
  formatContent(message) {
    const attachments = message.attachments.map((x) => `[${x.name}](${x.url})`);
    const content = Util.escapeMarkdown(message.content);
    return (
      (content ? `${content}\n\n` : "") + (attachments.length ? `__Attachments__\n${attachments.join("\n")}` : "") ||
      "Unknown message"
    );
  }

  /**
   * Finds an open thread from a channelID, userID or mailID
   * @param {string|number} id
   */
  findOpenThread(id) {
    return this.guild.settings.mail.threads.filter(
      (x) => [x.id, x.channelID, x.user].includes(id) && x.state === THREAD_STATUS.OPEN
    )[0];
  }

  /**
   * Finds an open thread channel from a channelID, userID or mailID
   * @param {string|number} id
   */
  findOpenThreadChannel(id) {
    const thread = this.findOpenThread(id) || {};
    return this.inbox.channels.cache.get(thread.channelID);
  }

  /**
   * Returns an array of all the user's threads
   * @param {KlasaUser} id
   */
  findAllUserThreads(id) {
    return this.guild.settings.mail.threads.filter((x) => x.user === id);
  }

  get nextMailID() {
    return this.guild.settings.mail.id + 1;
  }

  get responderRole() {
    return this.inbox.roles.cache.get(ROLES.RESPONDER);
  }

  get mailAudit() {
    return this.inbox.channels.cache.get(CHANNELS.MAIL_AUDIT);
  }

  get actionAudit() {
    return this.inbox.channels.cache.get(CHANNELS.ACTION_AUDIT);
  }

  get transcriptAudit() {
    return this.inbox.channels.cache.get(CHANNELS.TRANSCRIPT_AUDIT);
  }

  get pendingParent() {
    return this.inbox.channels.cache.get(CHANNELS.PENDING_PARENT);
  }

  get suspendedParent() {
    return this.inbox.channels.cache.get(CHANNELS.SUSPENDED_PARENT);
  }

  get awaitingParent() {
    return this.inbox.channels.cache.get(CHANNELS.AWAITING_PARENT);
  }
};
