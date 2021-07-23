// Checks for expired bans every so often and reverts them.

import log from 'another-logger';
import {EventListener} from 'yuuko';

export default new EventListener('ready', ({client, db}) => {
	const collection = db.collection('bans');

	// This function calls itself every 60 seconds as long as the bot is running.
	// TODO: same crap as with reminders
	async function checkBans () {
		// Fetch bans from the database that have become due since the last check
		const expiredBans = await collection.find({
			expirationDate: {$lt: new Date()},
			revokeDate: {$exists: false},
			autoRevokeDate: {$exists: false},
		}).toArray();
		log.debug('Expired bans:', expiredBans);

		expiredBans.forEach(ban => {
			// Try to unban the guild member. If it fails, either the ban no longer exists or we don't have permissions
			client.unbanGuildMember(ban.guildID, ban.userID).catch(error => {
				if (error.code === 10026) { // Unknown Ban
					// This isn't an error condition, the ban was just manually
					// revoked by a mod without using the unban command (or we
					// unbanned the user last run but the info wasn't updated).
					// We'll treat it as if we'd just unbanned the user anyway.
					return;
				}
				throw error;
			}).then(async () => {
				// Update the ban in the database
				await collection.updateOne({_id: ban._id}, {
					$set: {
						autoRevokeDate: new Date(),
					},
				});
			}).catch(error => {
				// Unbanning the user failed, or updating the ban info failed.
				log.error(`Failed to unban guild member ${ban.userID} or update ban in database:`, error);
			});
		});
	}
	setInterval(() => {
		if (client.ready) {
			checkBans().catch(log.error);
		} else {
			log.warn('Client disconnected while trying to check bans; skipping');
		}
	}, 60 * 1000);
}, {
	once: true,
});
