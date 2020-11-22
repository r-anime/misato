// Entry point for the bot. Manages the bot's database connection, command
// loading, and Discord connection.

const path = require('path');

const {Client} = require('yuuko');
const {MongoClient} = require('mongodb');
const log = require('another-logger')({label: 'discord'});

const config = require('../config');

(async () => {
	// Set up MongoDB connection
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	log.success('Connected to MongoDB on', config.mongodb.url);
	const db = mongoClient.db(config.mongodb.databaseName);

	// Create the bot
	const bot = new Client({
		token: config.discord.token,
		prefix: config.discord.prefix,
		disableDefaultMessageListener: true,
		restMode: true,
		// HACK: required for user lookup by tag, better options available
		// see https://github.com/discord/discord-api-docs/issues/2111 for alternatives
		// #76
		getAllUsers: true,
	});

	// Log on notable events
	bot.on('ready', () => {
		log.success(`Connected to Discord as ${bot.user.username}#${bot.user.discriminator}`);
	});
	bot.on('error', log.erisError);
	bot.on('warn', log.erisWarn);

	// Add MongoDB stuff to the bot's context for easy access from commands
	bot.extendContext({mongoClient, db});

	// Register commands and event listeners
	bot.addDir(path.join(__dirname, 'commands'));
	bot.addDir(path.join(__dirname, 'events'));

	// Connect the bot to Discord
	bot.connect();

	// TODO hardcoded verification crap here
	db.collection('redditAccounts').watch().on('change', async change => {
		log.info('change', change);
		if (change.operationType !== 'insert') {
			return;
		}
		const {userID, redditName, guildID} = change.fullDocument;
		log.debug(userID, redditName, guildID);
		if (guildID !== config.TEMP_guildID) {
			return;
		}
		try {
			await bot.addGuildMemberRole(guildID, userID, config.TEMP_roleID);
			log.debug(`Verified <@${userID}> (/u/${redditName})`);
		} catch (error) {
			log.error(`Failed to verify <@${userID}> (/u/${redditName})\n`, error);
		}
	});
})();
