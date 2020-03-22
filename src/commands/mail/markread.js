const { Command } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      aliases: ["read"],
      description: "Marks a mail thread as read.",
      extendedHelp:
        "This command can only be run in thread channels. Usually run when responders have acknowledged the thread, and there is no need to reply. A thread is unread when a new message is received from the thread user. Additionally, a thread is automatically marked as read if responders reply to the user."
    });
  }

  async run(message) {
    const Inbox = new InboxManager({ client: this.client }, message);
    const thread = Inbox.findOpenThread(message.channel.id);
    const threadChannel = Inbox.findOpenThreadChannel(thread.channelID);

    if (threadChannel) {
      this.client.Queue.add(async () => {
        await Inbox.markread(thread, threadChannel);
        return await message.sendMessage(this.client.success);
      });
    }
  }
};
