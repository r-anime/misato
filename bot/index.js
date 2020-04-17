// Entry point for the bot. Manages the bot's database connection, command loading, and Discord connection.

const path = require('path');

const {Client} = require('yuuko');
const {MongoClient} = require('mongodb');
const log = require('another-logger');

const config = require('../config');

(async () => {
	// Set up MongoDB connection
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
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

	// Filtering stuff
	// TODO: Split into own file
	bot.on('messageCreate', async msg => {
		try {
			if (msg.content.includes('fuck')) {
				await msg.delete();
				await msg.channel.createMessage('hey u cant say that here u butt');
			} else if (msg.attachments.some(attachment => attachment.filename.endsWith('.png'))) {
				await msg.delete();
				await msg.channel.createMessage('images are banned btfo');
			}
		} catch (error) {
			log.error(error);
		}
	});

	// Connect the bot to Discord
	bot.connect();
})();
