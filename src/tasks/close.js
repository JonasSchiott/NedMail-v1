const { Task } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Task {
  async run(data) {
    const Inbox = new InboxManager({ client: this.client });
    const threadChannel = Inbox.findOpenThreadChannel(data.channelID);

    if (threadChannel) {
      await threadChannel.send("Closing...");
      threadChannel.delete().catch(() => {});
    }
  }
};
