// Entry point for the bot. Manages the bot's database connection, command
// loading, and Discord connection.

import path from 'path';

import {Client} from 'yuuko';
import createLogger from 'another-logger';
const log = createLogger({label: 'discord'});

import config from '../../config';

export default (mongoClient, db) => {
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
		intents: ['all'],
		// TODO: Remove when Eris is updated and this becomes default behavior
		rest: {
			decodeReasons: false,
		},
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

	// Make a helper for displaying help information from commands
	const helpCommand = bot.commandForName('help');
	bot.extendContext({
		helpCommand,
		sendHelp (msg, ctx) {
			const command = ctx.commandName;
			ctx.commandName = helpCommand.names[0];
			helpCommand.process(msg, command.split(' '), ctx);
		},
	});

	// Connect the bot to Discord
	bot.connect();

	// TODO this should be handled elsewhere
	db.collection('redditAccounts').watch().on('change', async change => {
		log.info('change', change);
		if (change.operationType !== 'insert') {
			return;
		}
		const {userID, redditName, guildID} = change.fullDocument;
		log.debug(userID, redditName, guildID);

		let roleID;
		try {
			const verificationConfig = await db.collection('verificationConfiguration').findOne({guildID});
			if (!verificationConfig) {
				return;
			}
			roleID = verificationConfig.roleID;
		} catch (error) {
			log.error(`Database error fetching verification config for guild ${guildID}:`, error);
			return;
		}

		try {
			await bot.addGuildMemberRole(guildID, userID, roleID);
			log.debug(`Verified <@${userID}> (/u/${redditName})`);
		} catch (error) {
			log.error(`Failed to add role ${roleID} to <@${userID}> (/u/${redditName}) in guild ${guildID}:`, error);
		}
	});

	return bot;
};
