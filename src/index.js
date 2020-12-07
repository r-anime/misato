// This file acts as a manager. It maintains a database connection, spawns the
// bot process and web server, and coordinates communication between these three
// parts of the system via `child_process` IPC.

const log = require('another-logger')({label: 'core'});
const {MongoClient} = require('mongodb');

const config = require('../config');
const createDiscordClient = require('../bot');
const createWebServer = require('../web');

(async () => {
	// Set up MongoDB
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	log.success('Connected to MongoDB on', config.mongodb.url);
	const db = mongoClient.db(config.mongodb.databaseName);

	// Start the Discord bot
	log.debug('Spawning discord bot process');
	const discordClient = createDiscordClient(mongoClient, db);

	// Spawn the web server process
	log.debug('Spawning web server process');
	createWebServer(mongoClient, db, discordClient);
})();
