const { Command } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      description: "Alerts a user when a thread gets a new response.",
      usage: "[thread:mailThread|cancel|stop|abort]"
    });
  }

  async run(message, [mailThread]) {
    const Inbox = new InboxManager({ client: this.client }, message);
    const thread =
      Inbox.findOpenThread((typeof mailThread === "object" && mailThread.channelID) || message.channel.id) || {};
    const threadChannel = Inbox.findOpenThreadChannel(thread.channelID);

    if (threadChannel) {
      const alert = await Inbox.alert(thread, message.author.id, typeof mailThread === "string");
      message.sendMessage([this.client.success, !alert ? "Unsubscribed" : ""].join(" "));
    }
  }
};
