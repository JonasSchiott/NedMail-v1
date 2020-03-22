const { Argument } = require("klasa");
const SnippetManager = require("@managers/Snippet");

module.exports = class extends Argument {
  async run(arg, possible, message) {
    const Snip = new SnippetManager(this.client.settings);
    const snippet = Snip.get(arg);
    if (snippet) {
      return snippet;
    }

    throw message.language.get("RESOLVER_INVALID_USER", possible.name);
  }
};
