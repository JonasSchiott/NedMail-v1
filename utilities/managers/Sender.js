const Mail = require("./Mail");
const { GuildMember } = require("discord.js");

module.exports = class Sender extends Mail {
	/**
	 * @param {GuildMember} member
	 */
	constructor(user) {
		super(user.client, user);
	}

	send(content) {}
};
