import log from 'another-logger';
import polka from 'polka';
import * as util from '../util';
import {isValidRule} from '../../common/filters';

export default (db, client) => polka()
	.get('/:guildID/configuration', async (request, response) => {
		const {guildID} = request.params;

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		let filterConfig;
		try {
			filterConfig = await db.collection('messageFilters').findOne({guildID});
		} catch (error) {
			log.error(`Database error while fetching filter config for guild ${guildID}:`, error);
			response.writeHead(500);
			response.end();
			return;
		}

		if (!filterConfig) {
			response.writeHead(404);
			response.end();
			return;
		}

		response.end(JSON.stringify(filterConfig.rule));
	})

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

		// Try to parse the filter rule from the request body
		let rule;
		try {
			rule = JSON.parse(requestBody);
			if (!isValidRule(rule)) {
				throw new Error('Invalid rule');
			}
		} catch (error) {
			response.writeHead(400);
			response.end();
			return;
		}

		// Save the rule to the database
		try {
			await db.collection('messageFilters').replaceOne({guildID}, {guildID, rule}, {
				upsert: true,
			});
		} catch (error) {
			log.error(`Database error while writing filter config for guild ${guildID}:`, error);
			response.writeHead(500);
			response.end();
			return;
		}

		response.writeHead(201);
		response.end();
	})

	.delete('/:guildID/configuration', async (request, response) => {
		const {guildID} = request.params;

		// Users updating configuration must have permission
		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		try {
			await db.collection('messageFilters').deleteOne({guildID});
		} catch (error) {
			log.error(`Database error while deleting filter config for guild ${guildID}:`, error);
			response.writeHead(500);
			response.end();
			return;
		}

		response.writeHead(201);
		response.end();
	});
