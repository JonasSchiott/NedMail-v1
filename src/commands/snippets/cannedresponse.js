const { Command } = require("klasa");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      aliases: ["cr"],
      description: "Sends a snippet to the user. If the first argument is 'anon', the mail is sent anonymously.",
      extendedHelp: "No extended help.",
      usage: "<anon|anonymous|base:default> <snippet:snippet>",
      usageDelim: " "
    });

    this.customizeResponse("snippet", "Please provide a snippet to send.");
  }

  async run(message, [type, snippet]) {
    this.client.commands.get("reply").run(message, [type, snippet.response]);
  }
};
