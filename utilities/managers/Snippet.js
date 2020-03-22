module.exports = class Snippet {
  constructor(db) {
    this.db = db;
  }

  /**
   * Returns all of the snippets
   */
  all() {
    return this.db.snippets || [];
  }

  /**
   * Name or alias of the snippet
   * @param {string} name Name or alias of a snippet
   */
  get(name = "") {
    const snippets = this.all();
    return snippets.find((x) => x.names.includes(name.toLowerCase()));
  }

  /**
   * Adds a name to the list of snippet names
   * @param {string} name
   */
  async create(name, response, author) {
    const snippet = this.get(name);
    if (!snippet) {
      const snippets = this.all();
      snippets.push({
        names: [name],
        response,
        createdBy: { tag: author.tag, id: author.id },
        createdAt: new Date()
      });

      return await this.save(snippets);
    }
  }

  /**
   *
   * @param {string} name
   */
  async delete(name = "") {
    const snippet = this.get(name);
    if (snippet) {
      const snippets = this.all().filter((x) => !x.names.includes(name.toLowerCase()));
      return await this.save(snippets);
    }
  }

  async edit(name, updates) {
    const snippet = this.get(name);
    if (snippet) {
      for (const key of Object.keys(updates)) {
        snippet[key] = updates[key];
      }

      const snippets = this.all().filter((x) => !x.names.includes(name.toLowerCase()));
      snippets.push(snippet);
      return await this.save(snippets);
    }
  }

  async save(snippets) {
    return await this.db.update("snippets", snippets, { action: "overwrite", force: true });
  }
};
