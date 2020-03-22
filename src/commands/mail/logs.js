const { Command, Timestamp } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      aliases: ["l"],
      description: "Shows a user's previous mail logs.",
      usage: "[user:mailUser]"
    });
  }

  async run(message, [user]) {
    const Inbox = new InboxManager({ client: this.client }, message);
    const thread = Inbox.findOpenThread(message.channel.id);

    const target = user || (await Inbox.resolveUser(thread.user));
    if (!target) {
      return message.sendMessage("Please provide a valid user, thread, or run in a thread channel.");
    }

    const threads = Inbox.findAllUserThreads(target.id);
    const embed = new this.client.Embed()
      .setTitle(`Mail logs for ${target.tag}`)
      .setThumbnail(target.displayAvatarURL());

    if (!threads.length) {
      embed.setDescription("No previous logs");
    } else {
      embed.setDescription(
        threads
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((x) =>
            [
              `\`${new Timestamp("(HH:mm): L").display(x.createdAt)}\`:`,
              `Mail ID of **${x.id}**,`,
              `and **${x.messages.length}** message${x.messages.length !== 1 ? "s" : ""}`
            ].join(" ")
          )
          .join("\n")
      );
    }

    message.sendMessage(embed);
  }
};
