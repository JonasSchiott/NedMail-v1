const { Event } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Event {
  async run(old, message) {
    if (message.partial) await message.fetch();
    if (old.partial) await old.fetch();

    const Inbox = new InboxManager(message.author, message);
    const thread = Inbox.findOpenThread(message.author.id);

    if (!message.guild && thread.channelID) {
      Inbox.edit(thread);
    }
  }
};
