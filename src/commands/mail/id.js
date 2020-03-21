const { Command } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      aliases: ["userid"],
      description: "Shows the id of the mail thread user."
    });
  }

  async run(message) {
    const Inbox = new InboxManager(this.client.user, message);
    const thread = Inbox.findOpenThread(message.channel.id);

    if (thread) {
      message.sendMessage(thread.user);
    }
  }
};
