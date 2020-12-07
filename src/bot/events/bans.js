// Checks for expired bans every so often and reverts them.

const log = require('another-logger');
const {EventListener} = require('yuuko');

module.exports = new EventListener('ready', ({client, db}) => {
	const collection = db.collection('bans');

	// This function calls itself every 60 seconds as long as the bot is running.
	// TODO: same crap as with reminders
	(async function checkBans () {
		// Fetch bans from the database that have become due since the last check
		const expiredBans = await collection.find({expirationDate: {$lt: new Date()}}).toArray();
		log.debug('Expired bans:', expiredBans);

		expiredBans.forEach(ban => {
			// Try to unban the guild member. If it fails, either the ban no longer exists or we don't have permissions
			client.unbanGuildMember(ban.guildID, ban.userID).catch(() => {});
			// Remove the ban from the database, log on error
			collection.deleteOne({_id: ban._id}).catch(log.error);
		});

		// Queue this check to run again in 60 seconds
		setTimeout(checkBans, 10 * 1000);
	})();
});
