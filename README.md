# discord-mod-bot [![deploy status](https://img.shields.io/github/deployments/r-anime/discord-mod-bot/production?label=deploy)](https://github.com/r-anime/discord-mod-bot/deployments/activity_log?environment=production)

It's not much, but it's ours.

## Usage

### Requirements

- [Node](https://nodejs.org/en/download/) (tested against current LTS release)
- [Yarn 1.x](https://classic.yarnpkg.com/en/docs/install) (project not yet configured for yarn 2.x; using npm is not recommended)
- [MongoDB](https://www.mongodb.com/) 3.6+
  - For development purposes, you can [install MongoDB on your computer](https://docs.mongodb.com/manual/installation/).
  - In production, you probably want to configure a replica set to provide redundancy; check the [MongoDB replication docs](https://docs.mongodb.com/manual/administration/replica-set-deployment/) for more information. You can also use [Atlas](https://www.mongodb.com/cloud/atlas), Mongo's cloud hosting offering.

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

```bash
# Build the web frontend
yarn build
# Run the project (discord bot, web server and all)
yarn start
```

### Production notes

The provided sample configuration specifies a development-mode flag unless the `NODE_ENV` environment variable is set to `production`. This flag sets the Webpack build mode to `development` and disables caching filesystem calls on the web server. Therefore, in production environments, you should run the project with `NODE_ENV=production`, or manually set `dev: false` in the configuration file.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT &copy; 2020 the /r/anime mod team.](LICENSE)
