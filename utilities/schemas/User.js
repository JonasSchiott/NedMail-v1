const { KlasaClient } = require("klasa");
module.exports = KlasaClient.defaultUserSchema.add("blocked", "boolean", { default: false });
