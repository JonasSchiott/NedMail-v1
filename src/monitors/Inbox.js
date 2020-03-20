const { Monitor } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Monitor {
	constructor(store, file, directory) {
		super(store, file, directory, {
			ignoreOthers: false
		});
	}

	run(message) {
		if (!this.client.ready || message.guild) {
			return;
		}

		this.client.Queue.add(async () => {
			const Inbox = new InboxManager(message.author, message);

			if (Inbox.isBlocked()) {
				return Inbox.sender.sendBlocked();
			}

			if (Inbox.isResponder()) {
				return Inbox.sender.sendResponder();
			}

			await Inbox.receive();
		});
	}
};
