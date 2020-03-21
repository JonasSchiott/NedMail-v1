const { Command } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      aliases: ["mail", "mt"],
      description: "Opens a new thread with a user.",
      usage: "<user:user>"
    });
  }

  async run(message, [user]) {
    const Inbox = new InboxManager(user, message);
    const threadChannel = Inbox.findOpenThreadChannel(user.id);

    if (threadChannel) {
      return message.sendMessage(`Mail thread already exists: ${threadChannel}`);
    }

    if (Inbox.isResponder()) {
      return message.sendMessage(`**${user.tag}** is a mail responder.`);
    }

    if (user.settings.blocked) {
      return message.sendMessage(`**${user.tag}** is currently blocked.`);
    }

    message.sendMessage(this.client.success);
    this.client.Queue.add(async () => {
      await Inbox.createThread(true);
    });
  }
};
