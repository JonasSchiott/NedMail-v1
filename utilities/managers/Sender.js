const Mail = require("./Mail");
const { MESSAGES, COLORS } = require("@utils/Constants");
const { GuildMember, TextChannel } = require("discord.js");
const { KlasaUser } = require("klasa");

module.exports = class Sender extends Mail {
  /**
   * @param {GuildMember} member
   */
  constructor(user) {
    super(user.client, user);
  }

  /**
   * Sends a message to the user and the thread channel (if specified)
   * @param {string} content
   * @param {KlasaUser} sender
   * @param {TextChannel=} threadChannel
   * @param {object} thread
   */
  async send(message, sender, threadChannel, thread = {}) {
    if (!this.user.id) {
      this.user = await this.resolveUser(thread.user);
    }

    const embed = this.generateMessage(sender, this.formatContent(message));
    const sentMessage = this.user && (await this.user.send(embed).catch(() => {}));

    if (threadChannel) {
      threadChannel.send(embed[sentMessage ? "green" : "red"]());
      thread.messages.push({
        string: this.formatContent(message),
        content: message.content,
        attachments: message.attachments.map((x) => x.url),
        createdAt: message.createdAt
      });
      thread.read = true;

      return await this.save(thread);
    }
  }

  /**
   * Sends a message saying they're blocked from sending mail
   * @param {KlasaUser} user
   */
  async sendBlocked(user = this.user) {
    return await user.send(this.generateMessage(this.client.user, MESSAGES.BLOCKED, COLORS.RED)).catch(() => {});
  }

  /**
   * Sends a message saying they're a mail responder
   * @param {KlasaUser} user
   */
  async sendResponder(user = this.user) {
    return await user.send(this.generateMessage(this.client.user, MESSAGES.RESPONDER, COLORS.RED)).catch(() => {});
  }

  /**
   * Sends a message saying thread could not be created
   * @param {KlasaUser} user
   */
  async sendRetryOverload(user = this.user) {
    return await user.send(this.generateMessage(this.client.user, MESSAGES.RETRY_OVERLOAD, COLORS.RED)).catch(() => {});
  }

  /**
   * Sends a message saying staff have received their message
   * @param {KlasaUser} user
   */
  async sendReceived(user = this.user) {
    return await user.send(this.generateMessage(this.client.user, MESSAGES.RECEIVED)).catch(() => {});
  }
};
