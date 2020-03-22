const { Command } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      description: "Subscribes the author to mail alerts in a thread channel.",
      extendedHelp:
        "When a responder subscribes to mail alerts, the responder will be pinged when the bot receives a new message from the thread's user. A thread is determined by specifying a channel mention or id, or by running the command in a thread channel. Once a thread receives a message, all responders subscribed to alerts will be removed; they can re-subscribe by using the command again. If the first argument is either cancel, stop, or abort, the responder will be removed from the alert list. This command also works as a toggle, so if the responder is already subscribed to alerts, they will be removed.",
      usage: "[thread:mailThread|cancel|stop|abort]"
    });
  }

  async run(message, [mailThread = {}]) {
    const Inbox = new InboxManager(this.client.user, message);
    const thread = Inbox.findOpenThread(mailThread.channelID || mailThread.id || message.channel.id);
    const threadChannel = Inbox.findOpenThreadChannel(thread.channelID);

    if (threadChannel) {
      const alert = await Inbox.alert(thread, message.author.id, typeof mailThread === "string");
      return message.sendMessage([this.client.success, !alert ? "Unsubscribed" : ""].join(" "));
    }
  }
};
