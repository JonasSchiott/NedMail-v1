const { KlasaClient } = require("klasa");
module.exports = KlasaClient.defaultClientSchema.add("snippets", "any", { array: true });
