const { Command } = require("klasa");
const SenderManager = require("@managers/Sender");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      aliases: ["r"],
      description: "Sends mail to a thread user.",
      extendedHelp:
        "This command can only be run in thread channels. If the first argument is 'anon', the message will be sent with the responders name attached. Attachments are also automatically handled.",
      usage: "<anon|anonymous|base:default> <content:...string>",
      usageDelim: " "
    });
  }

  async run(message, [type, content]) {
    const Sender = new SenderManager({ client: this.client });
    const thread = Sender.findOpenThread(message.channel.id) || {};
    const threadChannel = Sender.findOpenThreadChannel(thread.channelID);
    const anonymous = type.includes("anon");

    if (threadChannel) {
      this.client.Queue.add(async () => {
        await Sender.send(
          { content, attachments: message.attachments, createdAt: message.createdAt },
          anonymous ? !anonymous : message.author,
          threadChannel,
          thread
        );

        if (message.deletable) {
          message.delete();
        }
      });
    }
  }
};
