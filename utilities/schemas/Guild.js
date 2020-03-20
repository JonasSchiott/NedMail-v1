const { KlasaClient } = require("klasa");
module.exports = KlasaClient.defaultGuildSchema.add("mail", (folder) => {
	folder
		.add("id", "number", { default: 1 })
		.add("threads", "any", { array: true })
		.add("responders", "string", { array: true });
});
