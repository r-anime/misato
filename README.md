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
# Start the web server
yarn run-web
# Start the bot
yarn run-bot
```

## Architecture & Contributing

This bot has two main parts: the bot process and the web process. These two processes communicate with each other via a [`node-ipc`]() connection, and they share a MongoDB database for persistent storage.

The web process is responsible for hosting the bot's web-based control panel and account verification interfaces. It acts as the "server" for the IPC connection, which means that it must be running for the bot process to function. Additionally, certain routine actions such as checking the database for reminders are the responsibility of the web process rather than the bot process.

The bot process is responsible for listening to Discord events, interpreting and responding to commands, and carrying out any other Discord actions that the web process tells it to do. The web process will use IPC broadcast to tell the bot process to carry out Discord actions when necessary.

This architecture is designed to facilitate sharding the bot process if needed in the future, without having to coordinate multiple web processes with a load balancer or something similar. (Sharding is the practice of running multiple instances of a Discord client, each of which listens for events in a portion of the bot's total guilds.) Additionally, having the bot process isolated from the web process allows for actions such as account verifications to be queued and executed later in the event of a Discord outage or an error in the bot process.

The project is written in [Node.js](https://nodejs.org) and relies heavily on a few other projects whose documentation will be helpful to contributors:
- [Yuuko](https://www.npmjs.com/package/yuuko), a Discord command framework based on the [Eris](https://www.npmjs.com/package/eris) API wrapper
- [Polka](https://www.npmjs.com/package/polka), an HTTP/HTTPS server framework similar to [Express](https://www.npmjs.com/package/express) but faster and lighter
- [node-ipc](https://www.npmjs.com/package/node-ipc), a package for easily establishing and working with IPC connections
- [node-fetch](https://www.npmjs.com/package/node-fetch), used for all HTTP requests

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
