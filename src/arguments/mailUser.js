const { Argument } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Argument {
  async run(arg, possible, message) {
    if (arg) {
      arg = arg.replace(/<>@!/, "");
    }

    const Inbox = new InboxManager({ client: this.client });
    const thread = Inbox.findOpenThread(arg) || {};
    const user = await this.client.users.fetch(thread.user).catch(() => {});
    if (user) {
      return user;
    }

    throw message.language.get("RESOLVER_INVALID_USER", possible.name);
  }
};
