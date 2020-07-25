const {Command} = require('yuuko');
const {parseGuildMember} = require('../util/discord');

module.exports = new Command('whois', async (message, args, {db}) => {
	const [member] = parseGuildMember(args.join(' '), message.channel.guild);
	if (member) {
		const results = await db.collection('redditAccounts').find({userID: member.id}).toArray();
		if (results.length) {
			message.channel.createMessage(`This user has ${results.length} reddit account${results.length === 1 ? '' : 's'} linked:${results.map(r => `\n- /u/${escape(r.redditName)}`).join('')}`).catch(() => {});
		} else {
			message.channel.createMessage('This user has not linked a Reddit account that I know of.').catch(() => {});
		}
	} else {
		message.channel.createMessage('Must pass a Discord user. Lookup by Reddit username soon:tm:').catch(() => {});
	}
});
