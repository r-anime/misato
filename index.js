// This file acts as a manager. It maintains a database connection, spawns the
// bot process and web server, and coordinates communication between these three
// parts of the system via `child_process` IPC.

const childProcess = require('child_process');

const log = require('another-logger')({label: 'core'});
const {MongoClient} = require('mongodb');
const sessionBase = require('express-session');
const MongoStore = require('connect-mongo')(sessionBase);

const {linkIPCStore} = require('./util/IPCStore');
const config = require('./config');

(async () => {
	// Set up MongoDB
	log.info('Connecting to database');
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	log.success('Connected to MongoDB on', config.mongodb.url);
	// const db = mongoClient.db(config.mongodb.databaseName);

	// Spawn the web server process
	log.info('Spawning web server process');
	const webProcess = childProcess.fork('./web/index.js', [], {
		serialization: 'advanced',
	});

	// Link the IPCStore running in the web process to an actual MongoStore that
	// will back the data to the database
	linkIPCStore(webProcess, new MongoStore({
		client: mongoClient,
		dbName: config.mongodb.databaseName,
	}));

	// Start the Discord bot
	log.info('Spawning discord bot process');
	const discordProcess = childProcess.fork('./bot', [], {
		serialization: 'advanced',
	});

	// Kill all child processes if this process exits
	process.on('exit', () => {
		webProcess.kill();
		discordProcess.kill();
	});
})();
