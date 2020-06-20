// This file acts as a manager. It maintains a database connection, spawns the
// bot process and web server, and coordinates communication between these three
// parts of the system via `child_process` IPC.

const childProcess = require('child_process');

const log = require('another-logger')({label: 'core'});
const {MongoClient} = require('mongodb');

const config = require('../config');

(async () => {
	// Set up MongoDB
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	log.success('Connected to MongoDB on', config.mongodb.url);
	// const db = mongoClient.db(config.mongodb.databaseName);

	// Spawn the web server process
	log.debug('Spawning web server process');
	const webProcess = childProcess.fork('./web/index.js', [], {
		serialization: 'advanced',
	});

	// Start the Discord bot
	log.debug('Spawning discord bot process');
	const discordProcess = childProcess.fork('./bot', [], {
		serialization: 'advanced',
	});

	// Kill all child processes if this process exits
	process.on('exit', () => {
		webProcess.kill();
		discordProcess.kill();
	});
})();
