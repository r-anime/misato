import createLogger from 'another-logger';
const log = createLogger({label: 'cmd:whois'});
import {Command} from 'yuuko';
import config from '../../../config';
import {parseUser, formatDate} from '../util/discord';
import {escape} from '../util/formatting';

// function for generating the reddit info
async function redditLine (userID, guildID, db) {
	let message = '__Reddit accounts: N/A__';

	try {
		const results = await db.collection('redditAccounts').find({userID, guildID}).toArray();
		message = `__Reddit accounts: **${results.length}**__${
			results.map(r => `\n- <https://www.reddit.com/u/${encodeURIComponent(r.redditName)}>`).join('')
		}`;
	} catch (error) {
		log.error('Couldn\'t Talk to Database', error);
	}
	return message;
}

async function warningsLine (userID, guildID, db) {
	let message = '__Warnings: N/A__';

	try {
		const numResults = await db.collection('warnings').countDocuments({userID, guildID});
		const results = await db.collection('warnings').find({userID, guildID}, {
			limit: 3,
			sort: {date: -1},
		}).toArray();

		message = `__Warnings: **${numResults}**__${
			results.map(kick => `\n- ${escape(formatDate(kick.date))}${kick.note ? `: ${escape(kick.note)}` : ''}`).join('')
		}${
			numResults > results.length ? '\nSee more on the website. (soon:tm:)' : ''
		}`;
	} catch (error) {
		log.error('Couldn\'t Talk to Database', error);
	}
	return message;
}

// function for generating the list of kicks
async function kicksLine (userID, guildID, db) {
	let message = '__Kicks: N/A__';

	try {
		// display the total count of kicks, but to save space only show the first 3 fully
		const numResults = await db.collection('kicks').countDocuments({userID, guildID});
		const results = await db.collection('kicks').find({userID, guildID}, {
			limit: 3,
			sort: {date: -1},
		}).toArray();

		message = `__Kicks: **${numResults}**__${
			results.map(kick => `\n- ${escape(formatDate(kick.date))}${kick.note ? `: ${escape(kick.note)}` : ''}`).join('')
		}${
			numResults > results.length ? '\nSee more on the website. (soon:tm:)' : ''
		}`;
	} catch (error) {
		log.error('Couldn\'t Talk to Database', error);
	}
	return message;
}

async function bansLine (userID, guildID, db) {
	let message = '__Bans: N/A__';

	try {
		const numResults = await db.collection('bans').countDocuments({userID, guildID});
		const results = await db.collection('bans').find({userID, guildID}, {
			limit: 3,
			sort: {date: -1},
		}).toArray();

		message = `__Bans: **${numResults}**__${
			results.map(ban => `\n- ${escape(formatDate(ban.date))}${ban.note ? `: ${escape(ban.note)}` : ''}`).join('')
		}${
			numResults > results.length ? '\nSee more on the website. (soon:tm:)' : ''
		}`;
	} catch (error) {
		log.error('Couldn\'t Talk to Database', error);
	}

	return message;
}

async function notesLine (userID, guildID, db) {
	let message = '__Notes: N/A__';
	try {
		const numResults = await db.collection('notes').countDocuments({userID, guildID});
		const results = await db.collection('notes').find({userID, guildID}, {
			limit: 3,
			sort: {date: -1},
		}).toArray();

		message = `__Notes: **${numResults}**__${
			results.map(note => `\n- ${escape(formatDate(note.date))}${note.note ? `: ${escape(note.note)}` : ''}`).join('')
		}${
			numResults > results.length ? '\nSee more on the website. (soon:tm:)' : ''
		}`;
	} catch (error) {
		log.error('Couldn\'t Talk to Database', error);
	}
	return message;
}

/**
 * Returns a string stating whether a user is still a member or not
 * Includes join date if user is currently in the server
 * @async
 * @param {Eris.Guild} guild
 * @param {number} userID
 * @returns {Promise<string>}
 */
async function isUserStillMember (guild, userID) {
	let isMember = true;
	let userDetails;
	try {
		userDetails = guild.members.get(userID);
		if (!userDetails) {
			userDetails = await guild.getRESTMember(userID);
		}
	} catch (error) {
		isMember = false;
	}
	return `__Still Member?: **${isMember ? `Yes, since ${formatDate(new Date(userDetails.joinedAt))}` : 'No'}**__`;
}

const command = new Command('whois', async (message, args, context) => {
	if (!args.length) {
		return context.sendHelp(message, context);
	}
	const {db} = context;

	const [user] = await parseUser(args.join(' '), message.channel.guild, message.author);
	if (!user) {
		const match = args.join(' ').match(/(?:\/?u\/)?([a-zA-Z0-9-_]+)/);
		if (!match) {
			message.channel.createMessage("Not sure who you're looking for. Must pass a Discord or Reddit user.").catch(() => {});
			return;
		}
		const redditName = match[1];
		const verifications = await db.collection('redditAccounts').find({
			redditName,
			guildID: message.channel.guild.id,
		}).toArray();

		message.channel.createMessage(`__Verifications for /u/${escape(redditName)}: **${verifications.length}**__${
			verifications.map(r => `\n- <@${r.userID}>`).join('')
		}`).catch(() => {});
		return;
	}
	const content = (await Promise.all([
		`<${config.web.host}/guilds/${message.channel.guild.id}/members/${user.id}>`,
		`__User: **<@${user.id}> (${user.username}#${user.discriminator})**__`,
		`__Account Age: **${formatDate(new Date(user.createdAt))}**__`,
		isUserStillMember(message.channel.guild, user.id),
		redditLine(user.id, message.channel.guild.id, db),
		warningsLine(user.id, message.channel.guild.id, db),
		kicksLine(user.id, message.channel.guild.id, db),
		bansLine(user.id, message.channel.guild.id, db),
		notesLine(user.id, message.channel.guild.id, db),
	])).join('\n\n');

	message.channel.createMessage({
		content,
		allowedMentions: {
			users: false,
		},
	}).catch(() => {});
}, {
	permissions: [
		'kickMembers',
		'banMembers',
	],
});
command.help = {
	args: '<discord or reddit user>',
	desc: 'Prints user information based on userID or name provided. ',
};
export default command;
