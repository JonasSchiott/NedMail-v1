const { Argument } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Argument {
  async run(arg, possible, message) {
    if (typeof arg === "string") {
      arg = arg.replace(/[\\<>@#!]/g, "");
    }

    const Inbox = new InboxManager({ client: this.client });
    const thread = Inbox.findOpenThread(arg);
    const user = await this.client.users.fetch(thread.user || arg).catch(() => {});
    if (user) {
      return user;
    }

    throw message.language.get("RESOLVER_INVALID_USER", possible.name);
  }
};
