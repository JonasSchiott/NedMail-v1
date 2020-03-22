const { Command } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      description: "Suspends a mail thread.",
      extendedHelp:
        "This command can only be run in thread channels. A suspended thread means the channel will omit activity. Although the thread is still open, it behaves the same as a closed thread; receiving new messages from the thread user will create a new thread, or direct the message to an existing one. Useful when a question cannot be answered by any active responder; higher or more knowledgeable responders are needed. Also, suspending a thread would be an example of an alternative to the close command, where the channel is not deleted. Moreover, the thread channel can be used for educational purposes or examples of good practice. The amount of suspended threads is unlimited, however, there cannot be multiple open threads; therefore, an open thread needs to be closed before unsuspension."
    });
  }

  async run(message) {
    const Inbox = new InboxManager(this.client.user);
    const thread = Inbox.findOpenThread(message.channel.id);

    if (thread.channelID) {
      this.client.Queue.add(async () => {
        await Inbox.suspend(thread);
        return await message.sendMessage(this.client.success);
      });
    }
  }
};
