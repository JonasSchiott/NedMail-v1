const { Monitor } = require("klasa");
const InboxManager = require("@managers/Inbox");

module.exports = class extends Monitor {
  constructor(store, file, directory) {
    super(store, file, directory, {
      ignoreOthers: false
    });
  }

  run(message) {
    if (!this.client.ready || message.guild) {
      return;
    }

    this.client.Queue.add(async () => {
      const Inbox = new InboxManager(message.author, message);

      if (Inbox.isResponder()) {
        return Inbox.sender.sendResponder();
      }

      if (Inbox.isBlocked()) {
        return Inbox.sender.sendBlocked();
      }

      if (Inbox.isScheduled()) {
        await Inbox.cancelClose();
      }

      if (Inbox.isOpen()) {
        const threadChannel = Inbox.findOpenThreadChannel(message.author.id);
        if (threadChannel && threadChannel.parent.id !== Inbox.pendingParent.id) {
          await threadChannel.setParent(Inbox.pendingParent).catch(() => {});
        }
      }

      await Inbox.receive();
    });
  }
};
