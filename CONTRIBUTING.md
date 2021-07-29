# Contributing

We welcome help from the community! Issues are accepted for questions, bug reports, and feature requests; pull requests are accepted for bugfixes and new features. **Please make an issue for any new features before dedicating the time to writing a PR.**

## Getting started

Fork the repo, clone it to your computer, and check [the README's "Usage" section](/README.md#usage) for notes on installing dependencies and running the project. From there, you're ready to start making your changes.

## Code style

The project has an ESLint configuration that works on both JS and TS files.

Lint your code with `yarn lint` (or `yarn lint --fix` to use ESLint's auto-fixing behavior) before submitting. You might consider configuring your editor to auto-fix ESLint issues when saving files.

## Architecture

At a high level, the bot consists of a Discord client, a web server, and a dataabse. The database stores persistant information including bot configuration and moderation notes. The discord client receives events from Discord which it interprets as commands, references the database, and sends data to and from Discord. The web server hosts a JSON API, which is used to interface the web frontend with the database and Discord. The API is consumed by a web frontend, which is [maintained separately](https://github.com/r-anime/misato-frontend).

The bot is written against a [MongoDB](https://mongodb.com) database, and relies heavily on a few other projects whose documentation will be helpful to contributors:
- [Yuuko](https://www.npmjs.com/package/yuuko), a Discord command framework based on the [Eris](https://www.npmjs.com/package/eris) API wrapper
- [Polka](https://www.npmjs.com/package/polka), an HTTP/HTTPS server framework similar to [Express](https://www.npmjs.com/package/express) but faster and lighter
- [node-fetch](https://www.npmjs.com/package/node-fetch), a [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) polyfill for Node used for all HTTP requests
