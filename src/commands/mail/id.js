const { Command } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      description: "Shows the id of the thread user.",
      extendedHelp: "This command must be run in a thread channel."
    });
  }

  async run(message) {
    const Inbox = new InboxManager(this.client.user);
    const thread = Inbox.findOpenThread(message.channel.id);

    if (thread) {
      throw `User's ID is: \`${thread.user}\`!`;
    }
  }
};
