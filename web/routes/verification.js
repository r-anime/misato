// Routes related to the verification interface for linking Reddit accounts to
// Discord accounts.

const polka = require('polka');
const log = require('another-logger');

module.exports = db => polka()

	// This route actually creates the relationship in the database
	.post('/:guildID', async (request, response) => {
		// Make sure the user is actually logged in with Reddit and Discord
		const reddit = request.session.redditUserInfo;
		if (!reddit) {
			response.writeHead(401);
			response.end('Not logged in with Reddit');
			return;
		}
		const discord = request.session.discordUserInfo;
		if (!discord) {
			response.writeHead(401);
			response.end('Not logged in with Discord');
			return;
		}

		try {
			// Check if the accounts are already linked and return early if so
			// TODO: implement this from Mongo via a compound primary key
			const existingLink = await db.collection('redditAccounts').findOne({
				userID: discord.id,
				guildID: request.params.guildID,
				redditName: reddit.name,
			});
			if (existingLink) {
				response.writeHead(201);
				response.end();
				return;
			}
			// Record the new connection
			// TODO: Once we have IPC working, broadcast the new verification info to the Discord process so the user's
			// role can be added
			await db.collection('redditAccounts').insertOne({
				userID: discord.id,
				guildID: request.params.guildID,
				redditName: reddit.name,
			});
		} catch (error) {
			log.error('Database error while processing reddit-discord link:', error);
			response.writeHead(500);
			response.end('An unexpected error occured. Get in touch with a bot developer.');
		}

		response.writeHead(201);
		response.end();
	});
