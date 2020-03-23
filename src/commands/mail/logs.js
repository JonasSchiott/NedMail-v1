const { Command, Timestamp, RichDisplay } = require("klasa");
const InboxManager = require("@managers/Inbox");
const { arrayChunk } = require("@utils/Functions");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      aliases: ["history"],
      description: "Shows a user's previous mail logs.",
      extendedHelp:
        "If the command is run in a thread channel, the user will default to the thread user. User can be a user id, or thread channel mention or id.",
      usage: "[user:mailUser]"
    });
  }

  async run(message, [user]) {
    const Inbox = new InboxManager({ client: this.client }, message);
    const thread = Inbox.findOpenThread(message.channel.id);

    const target = user || (await Inbox.resolveUser(thread.user));
    if (!target) {
      throw "Please provide a valid user, thread, or run in a thread channel.";
    }

    const threads = Inbox.findAllUserThreads(target.id);

    if (threads.length) {
      const logs = threads
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((x) =>
          [
            `\`${new Timestamp("(HH:mm): L").display(x.createdAt)}\`:`,
            `Mail ID of **${x.id}**,`,
            `and **${x.messages.length}** message${x.messages.length !== 1 ? "s" : ""}`
          ].join(" ")
        );

      const pages = arrayChunk(logs, 8).map((x) =>
        new this.client.Embed()
          .setTitle(`[${threads.length}] Mail logs for ${target.tag}`)
          .setThumbnail(target.displayAvatarURL())
          .setDescription(x.join("\n"))
      );

      if (!pages.length) {
        return message.sendEmbed({ description: "No logs found" }); // Unusual that this will happen
      }

      const paginator = new RichDisplay();
      for (const page of pages) {
        paginator.addPage(page);
      }

      const start = await message.sendMessage(pages[0]);

      return await paginator.run(start, {
        filter: (_, user) => user.id === message.author.id,
        prompt: "What page would you like to jump to?",
        time: 30000
      });
    }
  }
};
