const path = require('path');

const {Client} = require('yuuko');
const {MongoClient} = require('mongodb');
const log = require('another-logger');

const config = require('../config');

(async () => {
	// Set up MongoDB connection
	const mongoClient = new MongoClient(config.mongodb.url);
	await mongoClient.connect();
	const db = mongoClient.db(config.mongodb.databaseName);

	// Create the bot
	const bot = new Client({
		token: config.discord.token,
		prefix: config.discord.prefix,
	});

	// Register listeners
	bot.on('ready', () => {
		log.success(`Connected to Discord as ${bot.user.username}#${bot.user.discriminator}`);
	});
	bot.on('error', log.erisError);
	bot.on('warn', log.erisWarn);

	// Register commands
	bot.addCommandDir(path.join(__dirname, 'commands'));

	// Add MongoDB stuff to the bot's context for easy access from commands
	bot.extendContext({mongoClient, db});

	// Connect the bot to Discord
	bot.connect();
})();
