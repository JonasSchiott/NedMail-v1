const { Command } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      aliases: ["c"],
      description: "Closes a mail thread.",
      usage: "[duration:duration|cancel|stop|abort]"
    });
  }

  async run(message, [duration]) {
    const Inbox = new InboxManager({ client: this.client }, message);
    const thread = Inbox.findOpenThread(message.channel.id) || {};
    const threadChannel = Inbox.findOpenThreadChannel(thread.channelID);

    if (threadChannel) {
      this.client.Queue.add(async () => {
        if (Inbox.isScheduled(thread.user)) {
          await Inbox.cancelClose(thread.user, false);
        }

        let response = this.client.success;
        if (typeof duration === "object") {
          await this.client.schedule.create("close", duration, { id: thread.user, data: thread });
          response = `${response} Closing in ${Math.ceil((duration - new Date()) / 1000)} seconds. Use \`${
            this.client.options.prefix
          }close cancel\` to abort.`;
        } else if (!duration) {
          await this.client.tasks.get("close").run(thread);
        }

        return await message.sendMessage(response).catch(() => {});
      });
    }
  }
};
