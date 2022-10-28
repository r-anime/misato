import Eris from 'eris';
import {EventListener} from 'yuuko';
import config from '../../../config';
import createLogger from 'another-logger';
const log = createLogger({label: 'messageDelete'});
//  Should consider adding whether it was deleted by a mod or the user by cross referencing audit logs


export default new EventListener('messageDelete', (message, {client}) => {
	setTimeout(() => {
		if (!message) return;

		// Check if message was deleted in a DM or other guilds and do not log if so
		if (!message.guildID || message.guildID !== config.TEMP_guildID) return;

		// Check if the message is a partial message and if so do not log
		if (!(message instanceof Eris.Message)) return;

		// Check if the message was from a bot
		if (message.author.bot) return;


		// Ignore if message author has manage message ie. is a mod
		try {
			if (message.channel.permissionsOf(message.author.id).has('manageMessages')) return;
		} catch (error) {
			// The line in the try block sometimes crashes when you use the 'Delete Previous Messages' option when manually banning someone. Need to find out why
		}

		let content = '';

		if (message.content.length !== 0 && message.attachments.length !== 0) {
			content = 'Text and Attachments Deleted';
		} else if (message.content.length === 0 && message.attachments.length !== 0) {
			content = 'Attachments Deleted';
		} else {
			content = 'Text Deleted';
		}

		client.createMessage(config.TEMP_deletionLoggingChannelID, {
			embed: {
				title: 'Deletion Log',
				fields: [
					{
						name: 'Channel',
						value: `<#${message.channel.id}>\n\`${message.channel.id}\``,
						inline: true,
					},
					{
						name: 'Author',
						value: `<@${message.author.id}>\n\`${message.author.id}\``,
						inline: true,
					},
				],
				description: content,
				timestamp: new Date(message.createdAt),
			},
		}).catch(error => log.error(error));
	}, 2000);
});
