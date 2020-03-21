const { Command } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      aliases: ["mr", "read"],
      description: "Marks a mail thread as read - useful when a thread doesn't need a reply."
    });
  }

  async run(message) {
    const Inbox = new InboxManager({ client: this.client }, message);
    const thread = Inbox.findOpenThread(message.channel.id);
    const threadChannel = Inbox.findOpenThreadChannel(thread.channelID);

    if (threadChannel) {
      this.client.Queue.add(async () => {
        await Inbox.markread(thread, threadChannel);
        message.sendMessage(this.client.success);
      });
    }
  }
};
