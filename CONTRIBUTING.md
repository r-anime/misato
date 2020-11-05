# Contributing

We welcome help from the community! Issues are accepted for questions, bug reports, and feature requests; pull requests are accepted for bugfixes and new features. Please make an issue for any new features before dedicating the time to writing a PR.

## Getting started

Fork the repo, clone it to your computer, and check [the README's "Usage" section](/README.md#usage) for notes on getting the project up and running. From there, you're ready to start making your changes.

## Scope

something something feature creep bad

## Code style

The project has an ESLint configuration that works on both JS and Vue files.

Lint your code with `yarn lint` (or `yarn lint-fix` to use ESLint's auto-fixing behavior) before submitting. You might consider configuring your editor to auto-fix ESLint issues when saving files.

## Architecture

This project has three main processes: the bot, the web server, and the core. These three processes communicate with each other via inter-process communication (IPC).

The core process is the entry point. It is responsible for spawning the bot and web processes and coordinating IPC messages between them. For example, if the bot process needs to send real-time information to the web process to display to a user, the bot process sends an IPC message to the core, which then relays the message to the web process. The core also maintains a connection to the MongoDB database so it can run periodic tasks, such as fetching RSS feeds.

The web process is responsible for hosting the bot's web-based control panel and account verification interfaces, and the bot process is responsible for listening to Discord events to process commands, filter messages, monitor guild joins, etc. They both maintain their own database connections to persist data. Neither process has direct access to the other; they make use of IPC through the core process to send each other updates and ask each other to take actions.

This architecture is designed to facilitate sharding and load-balancing for the bot and web processes if needed in the future. Additionally, having the bot process isolated from the web process allows for actions such as account verifications to be queued and executed later in the event of a Discord outage or an error in the bot process.

The backend is written in [Node.js](https://nodejs.org) and relies heavily on a few other projects whose documentation will be helpful to contributors:
- [Yuuko](https://www.npmjs.com/package/yuuko), a Discord command framework based on the [Eris](https://www.npmjs.com/package/eris) API wrapper
- [Polka](https://www.npmjs.com/package/polka), an HTTP/HTTPS server framework similar to [Express](https://www.npmjs.com/package/express) but faster and lighter
- [node-fetch](https://www.npmjs.com/package/node-fetch), a [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) polyfill for Node used for all HTTP requests

The frontend is written in [Vue](https://vuejs.org/) with the [Buefy](https://buefy.org/) component library.
