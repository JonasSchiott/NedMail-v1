const { Monitor } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Monitor {
	constructor(store, file, directory) {
		super(store, file, directory, {
			ignoreOthers: false
		});
	}

	run(message) {
		if (!this.client.ready || message.guild) return;

		const Inbox = new InboxManager(message.author, message);

		if (Inbox.isBlocked()) {
			return Inbox.sendBlocked();
		}

		if (Inbox.isResponder()) {
			return Inbox.sendResponder();
		}

		Inbox.receive();
	}
};
