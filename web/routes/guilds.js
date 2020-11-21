const log = require('another-logger');
const polka = require('polka');

module.exports = (db, client) => polka()
	.get('/:guildID', async (request, response) => {
		try {
			// TODO: check if any properties seen by the bot shouldn't be sent to end users
			response.end(JSON.stringify(client.guilds.get(request.params.guildID) || await client.getRESTGuild(request.params.guildID)));
		} catch (error) {
			// TODO: handle errors other than not found
			log.debug(error);
			response.writeHead(404);
			response.end();
		}
	})

	// TODO: auth
	// NOMERGE
	.get('/:guildID/notes', async (request, response) => {
		const {guildID} = request.params;
		try {
			response.end(JSON.stringify(await db.collection('notes').find({guildID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	.get('/:guildID/members/:userID/notes', async (request, response) => {
		const {guildID, userID} = request.params;
		try {
			response.end(JSON.stringify(await db.collection('notes').find({guildID, userID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	.get('/:guildID/warnings', async (request, response) => {
		const {guildID} = request.params;
		try {
			response.end(JSON.stringify(await db.collection('warnings').find({guildID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	.get('/:guildID/members/:userID/warnings', async (request, response) => {
		const {guildID, userID} = request.params;
		try {
			response.end(JSON.stringify(await db.collection('warnings').find({guildID, userID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	.get('/:guildID/kicks', async (request, response) => {
		const {guildID} = request.params;
		try {
			response.end(JSON.stringify(await db.collection('kicks').find({guildID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	.get('/:guildID/members/:userID/kicks', async (request, response) => {
		const {guildID, userID} = request.params;
		try {
			response.end(JSON.stringify(await db.collection('kicks').find({guildID, userID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	.get('/:guildID/bans', async (request, response) => {
		const {guildID} = request.params;
		try {
			response.end(JSON.stringify(await db.collection('bans').find({guildID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	})

	.get('/:guildID/members/:userID/bans', async (request, response) => {
		const {guildID, userID} = request.params;
		try {
			response.end(JSON.stringify(await db.collection('bans').find({guildID, userID}).toArray()));
		} catch (error) {
			response.writeHead(500);
			response.end();
		}
	});
