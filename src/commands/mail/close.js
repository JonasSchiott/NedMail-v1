const { Command } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      aliases: ["c"],
      description: "Closes a mail thread.",
      usage: "[duration:duration|cancel:string]"
    });

    this.terms = ["cancel", "stop", "abort"];
  }

  async run(message, [duration]) {
    const Inbox = new InboxManager(this.client.user, message);
    const thread = Inbox.findOpenThread(message.channel.id) || {};
    const threadChannel = Inbox.findOpenThreadChannel(thread.channelID);

    if (threadChannel) {
      this.client.Queue.add(async () => {
        if (this.client.schedule.get(thread.user)) {
          await this.client.schedule.delete(thread.user).catch(() => {});
          if (typeof duration === "string" && this.terms.includes(duration.toLowerCase())) {
            return message.sendMessage(this.client.success);
          }
        }

        message.sendMessage(
          `${this.client.success} ${
            duration
              ? `Closing in ${Math.ceil((duration - new Date()) / 1000)} seconds. Use \`${
                  this.client.options.prefix
                }close cancel\` to abort.`
              : ""
          }`
        );

        if (duration) {
          this.client.schedule.create("close", duration, { id: thread.user, data: thread });
        } else {
          this.client.tasks.get("close").run(thread);
        }
      });
    }
  }
};
