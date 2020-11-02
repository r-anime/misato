const log = require('another-logger')({label: 'command:unban'});
const {Command} = require('yuuko');
const {parseUser} = require('../../util/discord');

module.exports = new Command('unban', async (message, args, {db}) => {
	const [user] = await parseUser(args.join(' ').trim(), message.channel.guild);
	if (!user) {
		message.channel.createMessage("Couldn't tell who you mean. Use a user ID or direct mention (user#discrim won't work).").catch(() => {});
		return;
	}

	// Unban from Discord
	try {
		message.channel.guild.unbanMember(user.id);
	} catch (error) {
		message.channel.createMessage('Couldn\'t unban from Discord. Is the user really banned? Do I have "Ban Members" permission?').catch(() => {});
		return;
	}

	// update database to revoke all bans that might be active
	try {
		const now = new Date();
		await Promise.all([
			db.collection('bans').updateMany(
				{userID: user.id, revokeDate: {$exists: false}, expirationDate: {$gt: now}},
				{$set: {revokeDate: now}},
			),
			db.collection('bans').updateMany(
				{userID: user.id, revokeDate: {$exists: false}, expirationDate: {$exists: false}},
				{$set: {revokeDate: now}},
			),
		]);
	} catch (error) {
		log.error(error);
		log.error('User:', user);
		message.channel.createMessage(`Unbanned <@${user.id}>, but there was an error writing to the database. Have a developer check the logs, this should not happen.`).catch(() => {});
		return;
	}

	// all good
	message.channel.createMessage(`Unbanned <@${user.id}>.`);
}, {
	permissions: [
		'banMembers',
	],
});

module.exports.help = {
	args: '<username, mention, or userID>',
	desc: 'Removes bans from specified users, allowing them to rejoin the server immediately.',
};