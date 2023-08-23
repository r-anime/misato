import createLogger from 'another-logger';
const log = createLogger({label: 'messageCreate'});
import {EventListener} from 'yuuko';
import {messageMatchesRule, isValidRule} from '../../common/filters';
import {blockquote} from '../util/formatting';

const {TEMP_LOGGING_CHANNEL_ID} = process.env;

export default new EventListener('messageCreate', async (message, {client, db}) => {
	if (message.author.bot) return;
	if (message.guildID) {
		// Fetch filter for this guild
		const configuration = await db.collection('messageFilters').findOne({guildID: message.guildID});

		// TODO: temporary hardcode to ignore the filter for people with manage messages
		if (!message.channel.permissionsOf(message.author.id).has('manageMessages')) {
			if (configuration && configuration.rule) {
				const {rule} = configuration;
				if (isValidRule(rule)) {
					if (await messageMatchesRule(message, rule)) {
						// Delete the message
						message.delete().catch(() => {});

						// Log the filtered message to the log channel
						// TODO: split this out into a proper logging utility
						client.createMessage(TEMP_LOGGING_CHANNEL_ID, {
							embed: {
								title: 'Message filtered',
								fields: [
									{
										name: 'Channel',
										value: `<#${message.channel.id}>\n\`${message.channel.id}\``,
										inline: true,
									},
									{
										name: 'Author',
										value: `<@!${message.author.id}>\n\`${message.author.id}\``,
										inline: true,
									},
								],
								description: blockquote(message.content),
								timestamp: new Date(message.createdAt),
							},
						}).catch(() => {});

						// Don't process commands from the deleted message
						return;
					}
				} else {
					// weird
					log.error('Encountered invalid rule in guild', message.guildID, rule);
				}
			}
		}
	}

	// If the message wasn't sent in a guild, or if none of the guild's filters matched, process commands on it
	client.processCommand(message);
});
