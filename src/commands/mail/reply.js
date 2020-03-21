const { Command } = require("klasa");
const SenderManager = require("@managers/Sender");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      aliases: ["r"],
      description: "Sends mail in a modmail thread. If the first argument is 'anon', the mail is sent anonymously.",
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
