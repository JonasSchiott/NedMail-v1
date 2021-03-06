const { Command } = require("klasa");
const InboxManager = require("@managers/Inbox");
const { convertMS } = require("@utils/Functions");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      description: "Closes a mail thread.",
      extendedHelp:
        "If a duration is specified, the thread will automatically close when the time is up. If either cancel, stop, or abort is specified, the scheduled close will be cancelled. Also, a scheduled close will be cancelled if the thread receives a new message.",
      usage: "[duration:duration|cancel|stop|abort]"
    });
  }

  async run(message, [duration]) {
    const Inbox = new InboxManager(this.client.user);
    const thread = Inbox.findOpenThread(message.channel.id);
    const threadChannel = Inbox.findOpenThreadChannel(thread.channelID);

    if (threadChannel) {
      this.client.Queue.add(async () => {
        if (Inbox.isScheduled(thread.user)) {
          await Inbox.cancelClose(thread.user);
        }

        let response = this.client.success;
        if (typeof duration === "object") {
          await this.client.schedule.create("close", duration, { id: thread.user, data: thread });

          if (threadChannel.parent.id !== Inbox.awaitingParent) {
            await threadChannel.setParent(Inbox.awaitingParent);
          }

          response = `${response} Closing in ${convertMS(duration - message.createdAt).string}. Use \`${
            this.client.options.prefix
          }close cancel\` to abort.`;
        } else if (!duration) {
          return await this.client.tasks.get("close").run(thread);
        }

        return await message.sendMessage(response).catch(() => {});
      });
    }
  }
};
