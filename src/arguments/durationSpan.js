const { MultiArgument } = require("klasa");

module.exports = class extends MultiArgument {
  constructor(...args) {
    super(...args, { aliases: ["...duration"] });
  }

  async run(arg, possible, message) {
    if (!arg) throw message.language.get("RESOLVER_INVALID_STRING", possible.name);
    const {
      args,
      usage: { usageDelim }
    } = message.prompter;
    const index = args.indexOf(arg);
    const rest = args.splice(index, args.length - index).join(usageDelim);
    args.push(rest);
    return this.base.run(rest, possible, message);
  }

  get base() {
    return this.store.get("duration");
  }
};
