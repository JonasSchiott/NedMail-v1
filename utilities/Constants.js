module.exports = {
  CLIENT_OPTIONS: {
    typing: true,
    commandEditing: true,
    prefixCaseInsensitive: true,
    createPiecesFolders: false,
    messageCacheMaxSize: 500,
    messageCacheLifetime: 2000,
    messageSweepInterval: 1000,
    commandMessageLifetime: 2000,
    owners: [process.env.OWNER],
    prefix: process.env.PREFIX,
    disabledCorePieces: ["commands"],
    partials: ["MESSAGE", "REACTION"],
    disableMentions: "everyone",
    schedule: { interval: 60000 },
    readyMessage: (client) => `Logged in as ${client.user.username}`,
    customPromptDefaults: { quotedStringSupport: true },
    presence: { activity: { name: process.env.PLAYING_STATUS } },
    console: { timestamps: "HH:mm", useColor: true, utc: true },
    pieceDefaults: { commands: { quotedStringSupport: true, permissionLevel: 0 } },
    providers: { default: "mongodb", mongodb: { connectionString: process.env.DATABASE_URI } }
  },

  COLORS: {
    MAIN: "578af7",
    RED: "ff6961",
    GREEN: "77dd77",
    ORANGE: "ffb347"
  },

  GUILDS: {
    MAIN: "670768213113569301",
    INBOX: "689910600670773297"
  },

  ROLES: {
    RESPONDER: "689974764995084347"
  },

  EMOJIS: {
    SUCCESS: "<:thumbsup:673280466924732418>"
  },

  CHANNELS: {
    MAIL_AUDIT: "689972360287485985",
    ACTION_AUDIT: "689975935470010473",
    TRANSCRIPT_AUDIT: "689972612344053770",
    PENDING_PARENT: "689970956730368023",
    SUSPENDED_PARENT: "689975847398146208",
    AWAITING_PARENT: "689971098947027041"
  },

  MESSAGES: {
    RECEIVED: "Thank you for your message! Hang tight, support responders will reply to you as soon as possible!",
    BLOCKED: "Whoops, looks like your blocked from sending mail.",
    RESPONDER: "Mail responders cannot send mail.",
    RETRY_OVERLOAD: "Something went wrong while redirecting your message to staff."
  },

  THREAD_STATUS: {
    OPEN: 1,
    CLOSED: 2,
    SUSPENDED: 3
  }
};
