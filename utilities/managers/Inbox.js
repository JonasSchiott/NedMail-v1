const Mail = require("./Mail");
const Sender = require("./Sender");
const { MESSAGES, COLORS } = require("@utils/Constants");
const { cleanName } = require("@utils/Functions");
const { KlasaUser, KlasaMessage } = require("klasa");
const moment = require("moment");

module.exports = class Inbox extends Mail {
	/**
	 * @param {KlasaUser} user
	 * @param {KlasaMessage} message
	 */
	constructor(user, message) {
		super(user.client, user);
		this.content = this.formatContent(message);
		this.sender = new Sender(this.client.user, user);
	}

	/**
	 * Manages the incoming message
	 * @param {string} content
	 */
	receive(content) {
		console.log(content);
	}

	async createThreadChannel(tries = 1) {
		if (tries > 3) {
			this.sender.send(MESSAGES.CREATION_RETRY.COLORS);
			return null;
		}

		try {
			const mailID = this.nextMailID;
			const channel = await this.inbox.channels.create(cleanName(this.user.tag), {
				topic: `Mail thread created for **${this.user.tag}** with reference ID ${mailID}`,
				parent: this.pendingParent,
				reason: `Created new mail thread for ${user.username}`
			});

			await this.sender.send(MESSAGES.RECEIVED);
			await channel.send(this.generateHeader(mailID));
			await this.guild.settings.update("mail.id", 1, { action: "add" });
			return channel;
		} catch {
			return await this.createThreadChannel(++tries);
		}
	}

	generateHeader(id) {
		const member = this.guild.members.cache.get(this.user.id);
		return new this.client.Embed()
			.setTitle(`Thread information [Ref: ${id}]`)
			.setThumbnail(this.client.user.displayAvatarURL())
			.setDescription(
				`**Username:** ${this.user.username}\n**ID:** ${this.user.id}\n**Account age:** ${moment(
					this.user.createdAt
				).format("L")}\n**Join age:** ${member ? moment(member.joinedAt).format("L") : "Unknown"}`
			);
	}
};
