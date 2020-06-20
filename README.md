# discord-mod-bot

It's not much, but it's ours.

## Usage

Use [Yarn](https://yarnpkg.com) instead of npm. Tested under Node 12.16.1.

### First-time setup

```bash
# Install dependencies
yarn
# Create your config file from the sample and fill it in
cp sample.config.js config.js && $EDITOR config.js
# Migrate the database
yarn migrate up
```

### Running the bot

```
# Build the web frontend
yarn build
# Run the project (discord bot, web server and all)
yarn start
```

### Production notes

The provided sample configuration specifies a development-mode flag unless the `NODE_ENV` environment variable is set to `production`. This flag sets the Webpack build mode to `development` and disables caching filesystem calls on the web server. Therefore, in production environments, you should run the project with `NODE_ENV=production`, or manually set `dev: false` in the configuration file.

## Architecture & Contributing

This project has three main processes: the bot, the web server, and the core. These three processes communicate with each other via inter-process communication (IPC).

The core process is the entry point. It is responsible for spawning the bot and web processes and coordinating IPC messages between them. For example, if the bot process needs to send real-time information to the web process to display to a user, the bot process sends an IPC message to the core, which then relays the message to the web process. The core also maintains a connection to the MongoDB database so it can run periodic tasks, such as fetching RSS feeds.

The web process is responsible for hosting the bot's web-based control panel and account verification interfaces, and the bot process is responsible for listening to Discord events to process commands, filter messages, monitor guild joins, etc. They both maintain their own database connections to persist data. Neither process has direct access to the other; they make use of IPC through the core process to send each other updates and ask each other to take actions.

This architecture is designed to facilitate sharding and load-balancing for the bot and web processes if needed in the future. Additionally, having the bot process isolated from the web process allows for actions such as account verifications to be queued and executed later in the event of a Discord outage or an error in the bot process.

The backend is written in [Node.js](https://nodejs.org) and relies heavily on a few other projects whose documentation will be helpful to contributors:
- [Yuuko](https://www.npmjs.com/package/yuuko), a Discord command framework based on the [Eris](https://www.npmjs.com/package/eris) API wrapper
- [Polka](https://www.npmjs.com/package/polka), an HTTP/HTTPS server framework similar to [Express](https://www.npmjs.com/package/express) but faster and lighter
- [node-fetch](https://www.npmjs.com/package/node-fetch), a [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) polyfill for Node used for all HTTP requests

The frontend is written in [Vue](https://vuejs.org/) with the [Buefy](https://buefy.org/) component library.

---

# TODOs

## Opt-in channel automation

this will be a pain but i believe

## RSS feeds

ez money, config page that just lets you map an RSS feed URL to a Discord channel, maybe with some custom options/filters/etc

## filters

- yuuko has bad support for this so it needs to be improved before we can really work on this bit soz

```js
{
    guildID: 'whatever',
    rule: {
        type: 'multiple',
        op: 'or',
        children: [
            {
                type: 'containsText',
                field: 'content',
                word: 'fuck',
            },
            {
                type: 'matchesRegexp',
                field: 'content',
                pattern: 'i like (trains|cars)',
                flags: '',
            },
            {
                type: 'multiple',
                op: 'and',
                children: [
                    {
                        type: 'containsText',
                        field: 'filename',
                        text: 'SPOILER',
                    },
                    {
                        type: 'matchesRegexp',
                        field: 'filename',
                        pattern: '\\.(png|jpe?g|gif)$',
                        flags: 'i',
                    },
                ],
            },
        ],
    },
}
```

which would be logically equivalent to (content contains "fuck") or (content matches `/i like (trains|cars)/`) or ((attachment filename contains "SPOILER") and (attachment filename matches `/\.(png|jpe?g|gif)$/i`))

filter UI similar to iTunes smart playlist thing

would merge word filters and extension filters

kinda like reddit automod but better

also restrictions based on channel, channel category, username, etc

sorta implemented but needs testing bc it's not hooked up to anything at all lol

## Reminders

make bernas happy

have the reminder get sent in whatever channel it was requested in e.g. support DMs

reminders collection: 

```js
{
    userID: 'whatever',
    channelID: 'whatever',
    requested: 12400923784,
    due: 1269834950,
    text: 'dab on the haters',
}
```

already kinda done but relative time parsing is a pain
