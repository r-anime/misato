import Eris from 'eris';
import {EventListener} from 'yuuko';
import config from '../../../config';
import {blockquote} from '../util/formatting';

//  Should consider adding whether it was deleted by a mod or the user by cross referencing audit logs

export default new EventListener('messageDelete', (message, {client}) => {
	setTimeout(() => {
		// Check if message was deleted in a DM or other guilds and do not log if so
		if (!message.guildID || message.guildID !== config.TEMP_guildID) return;

		// Check if the message is a partial message and if so do not log
		if (!(message instanceof Eris.Message)) return;

		// Check if the message was from a bot
		if (message.author.bot) return;

		// Ignore if message author has manage message ie. is a mod
		if (message.channel.permissionsOf(message.author.id).has('manageMessages')) return;

		const urlRegex = /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
		const content = message.content.trim().replace(urlRegex, '');

		// Ignore if message has no text content ie. message with just an attachment or just a link or both
		if (content.length === 0) return;

		client.createMessage(config.TEMP_loggingChannelID, {
			embed: {
				title: 'Message Deleted',
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
				description: blockquote(content),
				timestamp: new Date(message.createdAt),
			},
		}).catch(() => {});
	}, 2000);
});
