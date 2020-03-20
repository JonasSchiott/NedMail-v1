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
	 * @param {TextChannel=} threadChannel
	 * @param {KlasaUser} sender
	 */
	async send(content, sender, threadChannel) {
		const embed = this.generateMessage(sender, content);
		const message = await this.user.send(embed).catch(() => {});

		if (threadChannel) {
			threadChannel.send(embed[message ? "green" : "red"]());
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
