// This file acts as a manager. It maintains a database connection, spawns the
// bot process and web server, and coordinates communication between these three
// parts of the system via `child_process` IPC.

import {config} from 'dotenv';
config();

import createLogger from 'another-logger';
const log = createLogger({label: 'core'});
import {MongoClient} from 'mongodb';

const {MONGODB_CONNECTION_URI, MONGODB_DATABASE} = process.env;
import createDiscordClient from './bot';
import createWebServer from './web';

(async () => {
	// Set up MongoDB
	console.log(MONGODB_CONNECTION_URI);
	const mongoClient = new MongoClient(MONGODB_CONNECTION_URI, {useUnifiedTopology: true});
	await mongoClient.connect();
	log.success('Connected to MongoDB on', MONGODB_CONNECTION_URI);
	const db = mongoClient.db(MONGODB_DATABASE);

	// Start the Discord bot
	log.debug('Spawning discord bot process');
	const discordClient = createDiscordClient(mongoClient, db);

	// Spawn the web server process
	log.debug('Spawning web server process');
	createWebServer(mongoClient, db, discordClient);
})();
