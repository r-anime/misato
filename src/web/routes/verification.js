// Routes related to the verification interface for linking Reddit accounts to
// Discord accounts.

import polka from 'polka';
import log from 'another-logger';
import * as util from '../util';

export default (db, client) => polka()

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

		// Make sure the guild exists
		const guildID = request.params.guildID;
		if (!client.guilds.has(guildID)) {
			response.writeHead(404);
		}

		try {
			// Check if the accounts are already linked and return early if so
			const existingLink = await db.collection('redditAccounts').findOne({
				guildID,
				userID: discord.id,
				redditName: reddit.name,
			});
			if (existingLink) {
				response.writeHead(201);
				response.end();
				return;
			}
			// Record the new connection
			await db.collection('redditAccounts').insertOne({
				guildID,
				userID: discord.id,
				redditName: reddit.name,
			});
		} catch (error) {
			log.error('Database error while processing reddit-discord link:', error);
			response.writeHead(500);
			response.end('An unexpected error occured. Get in touch with a bot developer.');
			return;
		}

		response.writeHead(201);
		response.end();
	})

	// Gets the verification configuration for the guild
	.get('/:guildID/configuration', async (request, response) => {
		const {guildID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			const guildVerificationConfig = await db.collection('verificationConfiguration').findOne({guildID});
			if (!guildVerificationConfig) {
				response.writeHead(404);
				response.end();
				return;
			}
			response.end(JSON.stringify(guildVerificationConfig));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	// Updates the verification configuration for the guild
	.post('/:guildID/configuration', async (request, response) => {
		const {guildID} = request.params;

		// Users updating configuration must have permission
		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		// Request must have a JSON content-type
		if (request.headers['content-type'] !== 'application/json') {
			response.writeHead(415);
			response.end();
			return;
		}

		// Read the body of the request
		let requestBody = '';
		request.on('data', chunk => {
			requestBody += chunk;
		});
		await new Promise(resolve => request.once('end', resolve));

		// Try to parse information from the request body
		let roleID;
		try {
			const requestJSON = JSON.parse(requestBody);
			roleID = requestJSON.roleID;
		} catch (error) {
			response.writeHead(400);
			response.end();
			return;
		}

		// Ensure roleID is valid, if present
		const guild = client.guilds.get(guildID) || await client.getRESTGuild(guildID);
		if (roleID && (!guild.roles.some(role => role.id === roleID) || roleID === guildID)) {
			response.writeHead(422);
			response.end();
			return;
		}

		// Update configuration in the database
		try {
			const collection = db.collection('verificationConfiguration');
			if (roleID) {
				await collection.replaceOne({guildID}, {guildID, roleID}, {
					upsert: true,
				});
			} else {
				await collection.deleteOne({guildID});
			}
			response.end();
		} catch (error) {
			log.error('Database error while processing verification config:', error);
			response.writeHead(500);
			response.end();
		}
	});

