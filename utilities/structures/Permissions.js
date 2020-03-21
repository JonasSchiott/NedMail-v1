const { PermissionLevels } = require("klasa");
const { ROLES } = require("@utils/Constants");

module.exports = new PermissionLevels()

  // Everyone
  .add(0, () => true)

  // Mail responder
  .add(1, ({ member, guild }) => member && guild && member.roles.has(ROLES.RESPONDER))

  // Owner
  .add(2, ({ author, client }) => client.owners.has(author.id));
