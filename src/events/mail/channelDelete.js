const { Event } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Event {
  run(channel) {
    const Inbox = new InboxManager(this.client.user);
    Inbox.close(channel.id);
  }
};
