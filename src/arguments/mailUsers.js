const { MultiArgument } = require("klasa");

module.exports = class extends MultiArgument {
  constructor(...args) {
    super(...args, { aliases: ["...mailUser"] });
  }

  get base() {
    return this.store.get("mailUser");
  }
};
