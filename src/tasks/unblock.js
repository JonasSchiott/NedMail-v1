const { Task } = require("klasa");

module.exports = class extends Task {
  async run(data) {
    const user = await this.client.users.fetch(data.user.id).catch(() => {});
    if (user) {
      const Inbox = new (require("@managers/Inbox"))(user);
      await user.settings.update("blocked", false);

      if (Inbox.actionAudit) {
        const body = [
          `**User:** ${user.tag} (${user.id})`,
          `**Responder:** ${data.author.tag} (${data.author.id})`
        ].join("\n");

        return Inbox.actionAudit.send(
          new this.client.Embed()
            .setTitle("User Unblocked")
            .setDescription(body)
            .red()
        );
      }
    }
  }
};
