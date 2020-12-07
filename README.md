# discord-mod-bot

It's not much, but it's ours.

## Usage

### Requirements

- [Node](https://nodejs.org/en/download/) (tested against current LTS release)
- [Yarn 1.x](https://classic.yarnpkg.com/en/docs/install) (project not yet configured for yarn 2.x; using npm is not recommended)
- [MongoDB](https://www.mongodb.com/) 3.6+ ~~with a configured [replica set](https://docs.mongodb.com/manual/administration/replica-set-deployment/)~~
  - For development purposes, you can [install MongoDB on your computer](https://docs.mongodb.com/manual/installation/) ~~and then [convert your installed instance to a replica set without actually replicating data](https://docs.mongodb.com/manual/tutorial/convert-standalone-to-replica-set/)~~.
  - In production, you probably want to configure your replica set to do actual replication; check the [MongoDB replication docs](https://docs.mongodb.com/manual/administration/replica-set-deployment/) for more information. You can also use [Atlas](https://www.mongodb.com/cloud/atlas), Mongo's cloud hosting offering.
  - **Note:** Future features will require a connection to a replica set in order to take advantage of [change streams](https://docs.mongodb.com/v3.6/changeStreams/), but there are none that require it yet.

### First-time setup

```bash
# Install dependencies
yarn
# Create your config file from the sample and fill it in
cp sample.config.json config.js && $EDITOR config.json
# Migrate the database
yarn migrate up
```

### Running the bot

```bash
# Build the backend
yarn build
# Build the frontend
yarn build-web
# Start the bot
yarn start
```

### Production notes

Set the `NODE_ENV` environment variable to `production` when deploying. This flag sets the Webpack build mode to `production` and enables caching filesystem calls on the web server. This is done automatically when using `:prod` scripts (see the `scripts` section of [package.json](/package.json)).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT &copy; 2020 the /r/anime mod team.](LICENSE)

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
