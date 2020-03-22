const { Command } = require("klasa");
const { convertMS } = require("@utils/Functions");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      description: "Blocks a user from sending mail.",
      extendedHelp:
        "When a user is blocked and they attempt to contact the bot, an error message will be shown instead of the message being processed. Responders can still contact the user, but they won't be able to send messages back. A maximum of 10 users can be blocked at the same time. If no users are specified, the user will default to the thread user. If a duration is specified, the user will be automatically unblocked when the time is up.",
      usage: "<users:...mailUser{,10}|thread:custom> [duration:...duration]",
      usageDelim: " "
    });

    this.customizeResponse(
      "users",
      "Please provide a valid user, thread, or run this command in a thread."
    ).createCustomResolver("custom", async (_, __, message) => {
      const user = await this.client.arguments.get("mailUser").run(message.channel.id, __, message);
      return user && [user];
    });
  }

  async run(message, [users, duration]) {
    for (const user of users) {
      await user.settings.update("blocked", true);

      if (duration) {
        this.client.schedule.create("unblock", duration, { id: `block_${user.id}`, data: { user: user.id } });
      }
    }

    throw [
      this.client.success,
      users.length > 1 || duration ? "Blocked" : "",
      users.length > 1 ? `users ${users.map((x) => `**${x.tag}**`).join(", ")}` : "",
      duration ? `for ${convertMS(duration - message.createdAt).string}` : ""
    ]
      .filter((x) => x)
      .join(" ");
  }
};
