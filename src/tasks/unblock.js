const { Task } = require("klasa");

module.exports = class extends Task {
  async run(data) {
    const user = await this.client.users.fetch(data.user).catch(() => {});
    if (user) {
      user.settings.update("blocked", false);
    }
  }
};
