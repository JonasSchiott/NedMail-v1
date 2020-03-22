const { KlasaClient } = require("klasa");

const Embed = require("./Embed");
const Queue = require("./Queue");
const permissionLevels = require("./Permissions");

const defaultGuildSchema = require("@schemas/Guild");
const defaultUserSchema = require("@schemas/User");
const defaultClientSchema = require("@schemas/Client");

const Functions = require("@utils/Functions");
const Constants = require("@utils/Constants");

module.exports = class extends KlasaClient {
  constructor(options = {}) {
    super({ ...options, permissionLevels, defaultGuildSchema, defaultUserSchema, defaultClientSchema });
    this.Embed = Embed;
    this.Func = Functions;
    this.Config = Constants;
    this.Queue = new Queue(this);
    this.success = Constants.EMOJIS.SUCCESS;
  }
};
