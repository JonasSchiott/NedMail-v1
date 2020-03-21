const { MessageEmbed } = require("discord.js");
const { COLORS } = require("@utils/Constants");

module.exports = class extends MessageEmbed {
  constructor(data) {
    super(data);
    this.setColor(COLORS.MAIN).setTimestamp();
  }

  main() {
    return this.setColor(COLORS.MAIN);
  }

  green() {
    return this.setColor(COLORS.GREEN);
  }

  red() {
    return this.setColor(COLORS.RED);
  }
};
