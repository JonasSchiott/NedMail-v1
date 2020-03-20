# NedMail

A simple [Discord](https://discordapp.com/) communication tool built for [NedBot's support server](https://discord.gg/n5GWyxZ "Discord invite"). Inspired by Reddit's modmail system, NedMail is a secure, private way for users to contact an entire staff team in one easy-to-use inbox. Constructed with scalability in mind, NedMail is suitable for all operating servers.

Additionally, we consider all pull requests that either provide: performance improvements, code tweaks, features we deem useful, or bug fixes. If you have any problems while running the bot, you can open an issue, or [join our support server](https://discord.gg/n5GWyxZ "Discord invite").

### Cloning

To run the bot, we need to get the files on our system.

First, ensure you've installed [git](https://git-scm.com/ "Git installation page") and [node v12](https://nodejs.org/en/ "Node installation page") or above.

Next, open the terminal in a project folder - the folder the bot will be cloned.
You can open the terminal by `right-clicking` in the directory and pressing "Git bash here", or by `shift + right-clicking` and pressing "Open PowerShell window here" - may be different depending on your operating system.

Now run these three commands (in order) in your command line:

```bash
$ git init
$ git clone https://github.com/T3NED/NedMail.git Mail-bot
$ cd Mail-bot
```

### Installation

Now we need to install the necessary modules for the bot. The `npm run preinstall` script cleans the cached module aliases (need to run this every time before installing node modules). The `npm run postinstall` script allows use of module aliases.

Run these three commands in your command line:

```bash
$ npm run preinstall
$ npm install
$ npm run postinstall
```

### Running the bot

You will need to configure the bot's settings to allow the proper functionality:

- Create a copy of `.env.example` and name it `.env`
- Fill in the details in `.env` correspondng with the bot
- Change the settings in the [constants](utilities/Constants.js) file

Finally, run the bot with the following command:

```bash
$ node .
# or
$ node src/main
```

### Glossary

- NedBot - A [Discord](https://discordapp.com/) moderation bot
- NedMail - Refers to this repository
- Modmail - A communication system between users and staff
- Terminal - A window used to run commands on your system
- Command line - The line you execute commands
