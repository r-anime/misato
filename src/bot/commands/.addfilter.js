import {Command} from 'yuuko';
import {code} from '../util/formatting';

export default new Command('addfilter', async (message, args, {db}) => {
	// const filter = {
	// 	guildID: message.guildID,
	// 	rule: {
	// 		type: 'containsText',
	// 		field: 'content',
	// 		text: args.join(' '),
	// 	},
	// };
	// await db.collection('messageFilters').insertOne(filter);
	// message.channel.createMessage(`Created new filter for that.${code(JSON.stringify(filter, null, 2), 'json')}`);
}, {
	guildOnly: true,
	permissions: ['manageMessages'],
});
