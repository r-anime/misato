# misato [![deploy status](https://img.shields.io/github/deployments/r-anime/discord-mod-bot/production?label=deploy)](https://github.com/r-anime/discord-mod-bot/deployments/activity_log?environment=production)

It's not much, but it's ours.

For the frontend repository, which contains the web interface for configuration and account verification, see [r-anime/misato-frontend](https://github.com/r-anime/misato-frontend).

## Usage

You'll want a recent [Node](https://nodejs.org/en/download/), [Yarn 1.x](https://classic.yarnpkg.com/en/docs/install), and a [MongoDB](https://www.mongodb.com/) 3.6+ instance (self-hosted or on [Atlas](https://www.mongodb.com/cloud/atlas)). Make sure your Discord bot has the server members intent - it's required for now ([#76](https://github.com/r-anime/misato/issues/76)).

```bash
# Install dependencies
yarn
# Create your config file from the sample and fill it in
cp sample.config.js config.js && $EDITOR config.js
# Migrate the database
yarn migrate up
```

### Running the bot

```bash
# Install dependencies
yarn
# Run the project
yarn start
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT &copy; 2020 the /r/anime mod team.](LICENSE)
