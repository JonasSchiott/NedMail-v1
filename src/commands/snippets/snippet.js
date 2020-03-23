const { Command, Timestamp } = require("klasa");
const SnippetManager = require("@managers/Snippet");
const { capitalise } = require("@utils/Functions");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      aliases: ["snip", "s"],
      description: "Manages the snippets used like commands with the bot.",
      extendedHelp: "No extended help.",
      usage: "<create|delete|edit|info|view|list:default> [snippet:snippet] [changes:string] [...]",
      usageDelim: " "
    });

    this.edits = ["name", "response"];
  }

  async run(message, [type, snippet, ...args]) {
    const Snip = new SnippetManager(this.client.settings);
    const embed = new this.client.Embed();
    const format = (s) => {
      return s.names.length > 1 ? `[${s.names.map((x) => capitalise(x)).join("|")}]` : capitalise(s.names[0]);
    };

    switch (type) {
      case "create":
        if (!args[0] || !args[1]) {
          throw "You must provide a snippet name and a response.";
        }
        const response = args.slice(1).join(" ");
        const creation = await Snip.create(args[0], response, message.author);
        if (!creation) {
          throw `Snippet ${args[0]} already exists`;
        }
        embed.setTitle(capitalise(args[0])).setDescription(response);
        break;
      case "delete":
        const name = snippet ? snippet.names[0] : args[0];
        const deletion = await Snip.delete(name);
        if (!deletion) {
          throw "Couldn't find the snippet to delete.";
        }
        throw `Deleted the snippet \`${name}\`.`;
      case "edit":
        if (!snippet) {
          throw "Please provide a valid snippet.";
        }
        const type = this.edits.includes(args[0]) && args[0];
        if (!type) {
          throw "Please provide a valid property to edit.";
        }

        if (!args[1]) {
          throw "Please provide the value to change.";
        }

        const updates = {};
        let update = args.slice(1).join(" ");

        if (type === "name") {
          update = update.toLowerCase();
          if (snippet.names.includes(update)) {
            updates.names = snippet.names.filter((x) => !x.names.includes(update));
          } else {
            updates.names = [...snippet.names, update];
          }
        } else {
          updates.response = update;
        }

        const updated = await Snip.edit(snippet.names[0], updates);
        if (!updated) {
          throw `Snippet \`${args[1]}\` doesn't exist.`;
        }
        throw `Updated the snippet \`${snippet.names[0]}\`.`;

      case "info":
        if (typeof snippet !== "object") {
          throw "Please provide a valid snippet.";
        }
        embed
          .setTitle(format(snippet))
          .addField("**Created At:**", new Timestamp("L").display(snippet.createdAt), true)
          .addField("**Created By:**", `${snippet.createdBy.tag} (${snippet.createdBy.id})`, true)
          .addField("**Response:**", snippet.response);

        break;
      default:
        if (typeof snippet === "object") {
          embed.setTitle(format(snippet)).setDescription(snippet.response);
        } else {
          embed.setTitle("Snippet List").setDescription(
            Snip.all()
              .map((x) => `\`${x.names[0]}\``)
              .join(", ") || "None"
          );
        }
        break;
    }

    message.sendMessage(embed);
  }
};
