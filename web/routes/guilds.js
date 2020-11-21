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
	});

