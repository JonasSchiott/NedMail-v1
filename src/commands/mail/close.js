const { Command } = require("klasa");
const InboxManager = require("@managers/Inbox");
const { convertMS } = require("@utils/Functions");

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
          await Inbox.cancelClose(thread.user);
        }

        let response = this.client.success;
        if (typeof duration === "object") {
          await this.client.schedule.create("close", duration, { id: thread.user, data: thread });
          response = `${response} Closing in ${convertMS(duration - message.createdAt).string}. Use \`${
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
