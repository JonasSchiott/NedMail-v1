const { Command, Timestamp } = require("klasa");
const { convertMS } = require("@utils/Functions");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      aliases: ["tl", "duration"],
      description: "Shows how long is left on a mail block.",
      usage: "<user:mailUser>"
    });

    this.customizeResponse("user", "Please provide a valid user, thread, or run in a thread channel.");
  }

  async run(message, [user]) {
    if (!user.settings.blocked) {
      return message.channel.send(`**${user.tag}** is not blocked.`);
    }

    const schedule = this.client.schedule.get(`block_${user.id}`);
    throw `**${user.tag}** is blocked ${
      schedule ? `for another ${convertMS(schedule.time - message.createdAt).string}` : "indefinately"
    }.`;
  }
};
