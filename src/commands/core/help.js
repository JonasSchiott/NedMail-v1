const { Command } = require("klasa");

module.exports = class extends Command {
  constructor(store, file, directory) {
    super(store, file, directory, {
      runIn: ["text"],
      description: "Shows a full list of commands, or information about a command.",
      usage: "[command:command]",
      extendedHelp:
        "The 'command' argument can be a command name, or command alias. If a command is not specified, a list of commands will be sent instead."
    });
  }

  async run(message, [command]) {
    const embed = new this.client.Embed();

    if (command) {
      const name = command.usage.names.length > 1 ? `[${command.usage.names.join("|")}]` : command.name;
      const usage = command.usage.usageString.replace(/:[\w.?]+/gi, "");
      embed
        .setTitle(`${name} ${usage}`)
        .setDescription(command.description)
        .addField(`**Information:**`, command.extendedHelp)
        .setThumbnail(this.client.user.displayAvatarURL());
    } else {
      embed.setDescription(this.client.commands.map((x) => `\`${x.name}\``).join(", ")).setTimestamp(null);
    }

    return message.sendMessage(embed);
  }
};
