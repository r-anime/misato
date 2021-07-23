const {EventListener} = require('yuuko');
const log = require('another-logger')({label: 'event:reactionRoles'});

// A list of all the current reaction role configurations
let reactionRoles = [];

// Returns the reaction config for the given reaction information, if any
function findReactConfig (message, emoji) {
	return reactionRoles.find(rr => {
		// Snowflakes are unique, so if message ID matches we can assume channel and guild ID also match.
		if (message.id !== rr.messageID) return false;

		// For custom emojis, compare the emoji ID. For native emojis, the ID will be unset and the "name" will be
		// the unicode string.
		if (rr.emoji !== (emoji.id || emoji.name)) return false;

		return true;
	});
}

module.exports = new EventListener('ready', ({client, db}) => {
	// Refresh the list of reaction roles every 30 seconds
	async function fetchReactionRoles () {
		reactionRoles = await db.collection('reactionRoles').find({}).toArray();
		log.debug('Reaction roles:', reactionRoles);
	}
	setInterval(() => {
		if (client.ready) {
			fetchReactionRoles().catch(log.error);
		} else {
			log.warn('Client disconnected while trying to get reaction roles; skipping');
		}
	}, 30 * 1000);

	// Handle incoming reactions
	// TODO: eventually yuuko will support exporting multiple event listeners from a single file - do that instead of\
	//       waiting to register one listener after ready (this isn't a memory leak since we're using `once: true` on
	//       the ready listener, it's just ugly)
	client.on('messageReactionAdd', async (message, emoji, user) => {
		// If we're not in a guild, we know we can't have reaction roles
		if (!message.channel.guild) {
			return;
		}

		// Find the rule we care about for this reaction
		const relevantReactionRoleConfig = findReactConfig(message, emoji);

		// If this reaction doesn't match a rule, do nothing with it
		if (!relevantReactionRoleConfig) return;
		log.debug('Found relevant reaction config:', relevantReactionRoleConfig);

		// Assign the user the specified role
		try {
			await message.channel.guild.addMemberRole(user.id, relevantReactionRoleConfig.roleID);
			log.debug('Success');
		} catch (error) {
			// probably don't have permission, or the user is above us in the role list
			log.error(`Error adding role ${relevantReactionRoleConfig.roleID} to member ${user.id}:`, error);
		}
	});

	// Handle removed reactions
	client.on('messageReactionRemove', async (message, emoji, userID) => {
		// If we're not in a guild, we know we can't have reaction roles
		if (!message.channel.guild) {
			return;
		}

		// Find the rule we care about for this reaction
		const relevantReactionRoleConfig = findReactConfig(message, emoji);

		// If this reaction doesn't match a rule, do nothing with it
		if (!relevantReactionRoleConfig) return;

		// Remove the role from the user
		try {
			await message.channel.guild.removeMemberRole(userID, relevantReactionRoleConfig.roleID);
		} catch (error) {
			log.error(`Error removing role ${relevantReactionRoleConfig.roleID} from member ${userID}:`, error);
		}
	});
}, {
	once: true,
});
