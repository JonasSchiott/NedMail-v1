require("dotenv").config();

const Client = require("@struc/Client");
const { CLIENT_OPTIONS } = require("@utils/Constants");
const tokens = [process.env.STABLE_TOKEN, process.env.DEV_TOKEN];

const client = new Client(CLIENT_OPTIONS);
client.login(tokens[+process.env.LOGIN_TYPE - 1]).catch(e => client.console.error(e));
