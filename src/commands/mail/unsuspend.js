const { Command } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      description: "Unsuspends a mail thread.",
      extendedHelp:
        "If no users are specified, the user will default to the thread user. A suspended thread cannot be unsuspended if there is already an open thread."
    });
  }

  async run(message) {
    const Inbox = new InboxManager(this.client.user);
    const thread = Inbox.findSuspendedThread(message.channel.id);

    if (thread.channelID) {
      this.client.Queue.add(async () => {
        const unsuspend = await Inbox.unsuspend(thread);
        if (!unsuspend) {
          return await message.sendMessage("Cannot unsuspend a thread when one is open.");
        }
        return await message.sendMessage(this.client.success);
      });
    }
  }
};
