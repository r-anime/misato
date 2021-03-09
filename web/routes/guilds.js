const log = require('another-logger');
const polka = require('polka');
const fetch = require('node-fetch');
const {ObjectID} = require('mongodb');
const util = require('../util');

module.exports = (db, client) => polka()
	// TODO: this needs to be done better, more generically somehow
	.get('/managed', async (request, response) => {
		if (!request.session.discordUserInfo) {
			response.writeHead(401);
			response.end();
			return;
		}

		let guilds;
		try {
			guilds = await fetch('https://discordapp.com/api/v6/users/@me/guilds', {
				headers: {
					Authorization: `Bearer ${request.session.discordAccessToken}`,
				},
			}).then(r => {
				if (r.status !== 200) {
					throw new Error(`Non-200 status code: ${r.status}`);
				}
				return r.json();
			});
		} catch (error) {
			log.error(error);
			response.writeHead(500);
			response.end();
			return;
		}

		// TODO: do we need to check if the bot is in the guild too?
		guilds = await util.asyncFilter(guilds, guild => util.thisUserManagesGuild(request, client, db, guild.id));

		response.end(JSON.stringify(guilds));
	})

	.get('/:guildID', async (request, response) => {
		const {guildID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			// TODO: check if any properties seen by the bot shouldn't be sent to end users
			response.end(JSON.stringify(client.guilds.get(guildID) || await client.getRESTGuild(guildID)));
		} catch (error) {
			// TODO: handle errors other than not found
			log.debug(error);
			response.writeHead(404);
			response.end();
		}
	})

	.get('/:guildID/members', (request, response) => {
		// TODO
		response.writeHead(501);
		response.end();
	})

	.get('/:guildID/members/:memberID/about', async (request, response) => {
		const {guildID, memberID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			const guild = client.guilds.get(guildID) || await client.getRESTGuild(guildID);
			const member = guild.members.get(memberID) || await guild.getRESTMember(memberID);
			response.end(JSON.stringify(member));
		} catch (error) {
			log.debug(error);
			response.writeHead(404);
			response.end();
		}
	})

	.get('/:guildID/notes', async (request, response) => {
		const {guildID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			response.end(JSON.stringify(await db.collection('notes').find({guildID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	.get('/:guildID/members/:userID/notes', async (request, response) => {
		const {guildID, userID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			response.end(JSON.stringify(await db.collection('notes').find({guildID, userID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	.delete('/:guildID/members/:userID/notes/:noteID', async (request, response) => {
		const {guildID, userID, noteID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			const {deletedCount} = await db.collection('notes').deleteOne({
				_id: new ObjectID(noteID),
				// NOTE: IDs are unique universally, but we want guild and user ID to match too
				guildID,
				userID,
			});

			// If there was no document to delete, it must not exist
			if (!deletedCount) {
				response.writeHead(404);
				response.end();
				return;
			}

			response.writeHead(204);
			response.end();
		} catch (error) {
			log.error(`Database error deleting note ${noteID} on user ${userID} in guild ${guildID}:`, error);
			response.writeHead(500);
			response.end();
		}
	})

	.get('/:guildID/warnings', async (request, response) => {
		const {guildID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			response.end(JSON.stringify(await db.collection('warnings').find({guildID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	.get('/:guildID/members/:userID/warnings', async (request, response) => {
		const {guildID, userID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			response.end(JSON.stringify(await db.collection('warnings').find({guildID, userID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	.delete('/:guildID/members/:userID/warnings/:warningID', async (request, response) => {
		const {guildID, userID, warningID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			const {deletedCount} = await db.collection('warnings').deleteOne({
				_id: new ObjectID(warningID),
				// NOTE: IDs are unique universally, but we want guild and user ID to match too
				guildID,
				userID,
			});

			// If there was no document to delete, it must not exist
			if (!deletedCount) {
				response.writeHead(404);
				response.end();
				return;
			}

			response.writeHead(204);
			response.end();
		} catch (error) {
			log.error(`Database error deleting warning ${warningID} on user ${userID} in guild ${guildID}:`, error);
			response.writeHead(500);
			response.end();
		}
	})

	.get('/:guildID/kicks', async (request, response) => {
		const {guildID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			response.end(JSON.stringify(await db.collection('kicks').find({guildID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	.get('/:guildID/members/:userID/kicks', async (request, response) => {
		const {guildID, userID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			response.end(JSON.stringify(await db.collection('kicks').find({guildID, userID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	.delete('/:guildID/members/:userID/kicks/:kickID', async (request, response) => {
		const {guildID, userID, kickID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			const {deletedCount} = await db.collection('kicks').deleteOne({
				_id: new ObjectID(kickID),
				// NOTE: IDs are unique universally, but we want guild and user ID to match too
				guildID,
				userID,
			});

			// If there was no document to delete, it must not exist
			if (!deletedCount) {
				response.writeHead(404);
				response.end();
				return;
			}

			response.writeHead(204);
			response.end();
		} catch (error) {
			log.error(`Database error deleting kick ${kickID} on user ${userID} in guild ${guildID}:`, error);
			response.writeHead(500);
			response.end();
		}
	})

	.get('/:guildID/bans', async (request, response) => {
		const {guildID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			response.end(JSON.stringify(await db.collection('bans').find({guildID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	.get('/:guildID/members/:userID/bans', async (request, response) => {
		const {guildID, userID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			response.end(JSON.stringify(await db.collection('bans').find({guildID, userID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	.get('/:guildID/roles', async (request, response) => {
		const {guildID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			const guild = client.guilds.get(guildID) || await client.getRESTGuild(guildID);
			const roles = [...guild.roles.values()];
			response.end(JSON.stringify(roles));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	});
