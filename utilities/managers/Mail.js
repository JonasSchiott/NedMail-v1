const { GUILDS, CHANNELS, ROLES, COLORS, MESSAGES } = require("@utils/Constants");
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
		const responder = this.guild.settings.get("mail.responders").includes(user.id);
		return responder || (this.responderRole && member && member.roles.cache.has(this.responderRole.id));
	}

	/**
	 * @param {GuildMember} member
	 * @returns Whether the member is blocked from sending mail
	 */
	isBlocked(user = this.user) {
		return user.settings.get("blocked");
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
		const attachments = message.attachments.map(x => `[${x.name}](${x.url})`);
		const content = Util.escapeMarkdown(message.content);
		return content + (attachments.length ? `\n\n__Attachments:__\n${attachments.join("\n")}` : "") || "Unknown message";
	}

	get nextMailID() {
		return this.guild.settings.get("mail.id");
	}

	get responderRole() {
		return this.inbox.roles.cache.get(ROLES.RESPONDER);
	}

	get mailAudit() {
		return this.inbox.roles.cache.get(CHANNELS.MAIL_AUDIT);
	}

	get actionAudit() {
		return this.inbox.roles.cache.get(CHANNELS.ACTION_AUDIT);
	}

	get transcriptAudit() {
		return this.inbox.roles.cache.get(CHANNELS.TRANSCRIPT_AUDIT);
	}

	get pendingParent() {
		return this.inbox.roles.cache.get(CHANNELS.PENDING_PARENT);
	}

	get suspendedParent() {
		return this.inbox.roles.cache.get(CHANNELS.SUSPENDED_PARENT);
	}

	get awaitingParent() {
		return this.inbox.roles.cache.get(CHANNELS.AWAITING_PARENT);
	}
};
