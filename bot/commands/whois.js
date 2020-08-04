const {Command} = require('yuuko');
const {parseGuildMember, formatDate} = require('../util/discord');
const {escape} = require('../util/formatting');

// function for generating the reddit info
async function redditLine (userID, guildID, db) {
	const results = await db.collection('redditAccounts').find({userID, guildID}).toArray();
	return `__Reddit accounts: **${results.length}**__${
		results.map(r => `\n- /u/${escape(r.redditName)}`).join('')
	}`;
}

// function for generating the list of kicks
async function kicksLine (userID, guildID, db) {
	// display the total count of kicks, but to save space only show the first 3 fully
	const numResults = await db.collection('kicks').countDocuments({userID, guildID});
	const results = await db.collection('kicks').find({userID, guildID}, {
		limit: 3,
		sort: {date: -1},
	}).toArray();

	return `__Kicks: **${numResults}**__${
		results.map(kick => `\n- ${escape(formatDate(kick.date))}${kick.note ? `: ${escape(kick.note)}` : ''}`).join('')
	}${
		numResults > results.length ? '\nSee more on the website. (soon:tm:)' : ''
	}`;
}

async function bansLine (userID, guildID, db) {
	const numResults = await db.collection('bans').countDocuments({userID, guildID});
	const results = await db.collection('bans').find({userID, guildID}, {
		limit: 3,
		sort: {date: -1},
	}).toArray();

	return `__Bans: **${numResults}**__${
		results.map(ban => `\n- ${escape(formatDate(ban.date))}${ban.note ? `: ${escape(ban.note)}` : ''}`).join('')
	}${
		numResults > results.length ? '\nSee more on the website. (soon:tm:)' : ''
	}`;
}

module.exports = new Command('whois', async (message, args, {db}) => {
	const [member] = parseGuildMember(args.join(' '), message.channel.guild);
	if (!member) {
		message.channel.createMessage('Must pass a Discord user. Lookup by Reddit username soon:tm:').catch(() => {});
		return;
	}

	message.channel.createMessage((await Promise.all([
		redditLine(member.id, message.channel.guild.id, db),
		kicksLine(member.id, message.channel.guild.id, db),
		bansLine(member.id, message.channel.guild.id, db),
	])).join('\n\n')).catch(() => {});
});
