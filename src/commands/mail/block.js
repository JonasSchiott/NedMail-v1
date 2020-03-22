const { Command } = require("klasa");
const { convertMS } = require("@utils/Functions");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      aliases: ["b", "blacklist"],
      description: "Blocks a user from contacting mail",
      usage: "<users:...mailUser{,10}|thread:custom> [duration:...duration]",
      usageDelim: " "
    });

    this.customizeResponse(
      "users",
      "Please provide a valid user, thread, or run in a thread channel."
    ).createCustomResolver("custom", async (_, possible, message) => {
      const user = await this.client.arguments.get("mailUser").run(message.channel.id, possible, message);
      if (user) {
        return [user];
      }
    });
  }

  async run(message, [users, duration]) {
    for (const user of users) {
      await user.settings.update("blocked", true);
      if (duration) {
        this.client.schedule.create("unblock", duration, { id: `block_${user.id}`, data: { user: user.id } });
      }
    }

    message.sendMessage(
      [
        this.client.success,
        users.length > 1 || duration ? "Blocked" : "",
        users.length > 1 ? `users ${users.map((x) => `**${x.tag}**`).join(", ")}` : "",
        duration ? `for ${convertMS(duration - message.createdAt).string}` : ""
      ]
        .filter((x) => x)
        .join(" ")
    );
  }
};
