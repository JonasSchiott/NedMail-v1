const { Command } = require("klasa");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      aliases: ["ub", "whitelist"],
      description: "Unblocks a user from contacting mail",
      usage: "<users:...mailUser{,10}|thread:custom>",
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

  async run(message, [users]) {
    for (const user of users) {
      if (this.client.schedule.get(`block_${user.id}`)) {
        await this.client.schedule.delete(`block_${user.id}`).catch(() => {});
      }

      await user.settings.update("blocked", false);
    }

    throw `${this.client.success} ${
      users.length > 1 ? `Unblocked users ${users.map((x) => `**${x.tag}**`).join(", ")}` : ""
    }`;
  }
};
