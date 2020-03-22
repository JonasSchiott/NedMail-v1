const { Command } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      aliases: ["mail", "mt"],
      description: "Opens a new thread with a user.",
      extendedHelp:
        "Useful when responders wish to contact a user. This command opens a new thread, or redirects the author to an already-open one.",
      usage: "<user:user>"
    });

    this.customizeResponse("user", "Please provide a valid user mention or ID.");
  }

  async run(message, [user]) {
    const Inbox = new InboxManager(user, message);
    const threadChannel = Inbox.findOpenThreadChannel(user.id);

    if (threadChannel) {
      throw `Mail thread already exists: ${threadChannel}`;
    }

    if (Inbox.isResponder()) {
      throw `**${user.tag}** is a mail responder.`;
    }

    this.client.Queue.add(async () => {
      return await Inbox.createThread(true);
    });

    throw this.client.success;
  }
};
