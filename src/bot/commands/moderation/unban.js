import createLogger from 'another-logger';
const log = createLogger({label: 'command:unban'});
import {Command} from 'yuuko';
import {parseUser} from '../../util/discord';

const command = new Command('unban', async (message, args, context) => {
	if (!args.length) {
		return context.sendHelp(message, context);
	}
	const {db} = context;

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
command.help = {
	args: '<user>',
	desc: 'Removes bans from specified users, allowing them to rejoin the server immediately.',
};
export default command;
