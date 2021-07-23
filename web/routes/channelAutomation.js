const log = require('another-logger');
const polka = require('polka');
const util = require('../util');
const config = require('../../config');
const Eris = require('eris');

const tempChannelID = config.TEMP_channelAutomationChannelID;

function getStuffFromGuild (listMessages) {
	const allChannelContent = listMessages.reverse().map(message => message.content).join('\n');

	let currentCategoryName = '';
	const allCategories = new Map();
	const categoryOrder = [];
	for (const line of allChannelContent.split('\n')) {
		if (!line) continue;

		let match;
		if ((match = line.match(/\*\*=== (.+) ===\*\*/))) {
			currentCategoryName = match[1];
			categoryOrder.push(currentCategoryName);
		} else if ((match = line.match(/<a?:(?:[a-zA-Z0-9-_]+):(\d+)> <@&(\d+)>/))) {
			if (!allCategories.get(currentCategoryName)) {
				allCategories.set(currentCategoryName, []);
			}

			allCategories.get(currentCategoryName).push({
				emoji: match[1],
				roleID: match[2],
			});
		} else if ((match = line.match(/([^\w\d\s]+) <@&(\d+)>/))) {
			if (!allCategories.get(currentCategoryName)) {
				allCategories.set(currentCategoryName, []);
			}

			allCategories.get(currentCategoryName).push({
				emoji: match[1],
				roleID: match[2],
			});
		} else {
			log.error('???:', line);
		}
	}

	const result = {
		channelID: tempChannelID,
		categories: [],
	};
	categoryOrder.filter(name => allCategories.get(name)).forEach(name => {
		result.categories.push({
			name,
			triggers: allCategories.get(name),
		});
	});
	return result;
}

module.exports = (db, client) => polka()
	// TODO: move this to a different route
	.get('/emojis', (request, response) => {
		// Get emojis from all guilds
		const emojis = [];
		for (const guild of client.guilds.values()) {
			for (const emoji of guild.emojis) {
				if (emoji.available) {
					emojis.push({
						id: emoji.id,
						name: emoji.name,
						animated: emoji.animated,
						guildID: guild.id,
					});
				}
			}
		}

		response.setHeader('content-type', 'application/json; charset=utf-8');
		response.end(JSON.stringify(emojis));
	})

	.get('/:guildID', async (request, response) => {
		const {guildID} = request.params;

		// TODO: hardcoded
		if (guildID !== config.TEMP_guildID) {
			return;
		}

		if (!await util.thisUserManagesGuild(request, client, db, guildID)) {
			response.writeHead(401);
			response.end();
			return;
		}

		// Search through the messages in the channel and find all the existing categories and mappings
		const guild = client.guilds.get(config.TEMP_guildID);
		const listChannel = guild.channels.get(tempChannelID) || await client.getRESTChannel(tempChannelID);
		const listMessages = await listChannel.getMessages();

		// Gets the existing set of category mappings from the channel messages
		const otherJson = await getStuffFromGuild(listMessages);

		response.setHeader('content-type', 'application/json; charset=utf-8');
		response.end(JSON.stringify(otherJson));
	})

	.put('/:guildID', async (request, response) => {
		const {guildID} = request.params;

		// TODO: hardcoded
		if (guildID !== config.TEMP_guildID) {
			return;
		}

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

		// Try to parse the settings from the request body
		let json;
		try {
			json = JSON.parse(requestBody);
		} catch (error) {
			response.writeHead(400);
			response.end();
			return;
		}

		// TODO: Okay this is the weird custom logic part that eventually we'll want to completely redo

		// Search through the messages in the channel and find all the existing categories and mappings
		const guild = client.guilds.get(config.TEMP_guildID);
		const listChannel = guild.channels.get(tempChannelID) || await client.getRESTChannel(tempChannelID);
		const listMessages = await listChannel.getMessages();

		// Gets the existing set of category mappings from the channel messages
		const otherJson = await getStuffFromGuild(listMessages);

		// Wipe the reaction triggers
		const allOldTriggers = [].concat(...otherJson.categories.map(category => category.triggers));
		const allNewTriggers = [].concat(...json.categories.map(category => category.triggers));

		// Handle role/channel creation for triggers that need to create channels
		for (const t of allNewTriggers) {
			log.debug('new trigger', t);
			if (t.roleID === 'new-channel') {
				log.debug('Creating new channel');
				try {
					// eslint-disable-next-line no-await-in-loop
					const role = await guild.createRole({
						name: t.createdRoleName,
						hoist: false,
						mentionable: false,
						permissions: 0,
					}, 'New role and channel for reaction trigger');

					// eslint-disable-next-line no-await-in-loop
					await guild.createChannel(t.createdChannelName, 0, {
						parentID: t.createdChannelParentID || undefined,
						permissionOverwrites: [
							// TODO: remove Number conversions after eris#1197 makes it into a release
							{
								id: guild.id,
								type: 0,
								allow: 0,
								deny: String(Number(Eris.Constants.Permissions.viewChannel)),
							},
							{
								id: role.id,
								type: 0,
								allow: Number(Eris.Constants.Permissions.viewChannel),
								deny: 0,
							},
						],
						reason: 'New role and channel for reaction trigger',
					});

					t.roleID = role.id;
				} catch (error) {
					log.error('Failed to create channel and role:', error);

					response.writeHead(500);
					response.end();
					return;
				}
			} else if (t.roleID === 'new-role') {
				log.debug('Creating new role');
				try {
					// eslint-disable-next-line no-await-in-loop
					const role = await guild.createRole({
						name: t.createdRoleName,
						hoist: false,
						mentionable: false,
						permissions: 0,
					}, 'New role for reaction trigger');
					t.roleID = role.id;
				} catch (error) {
					log.error('Failed to create role:', error);

					response.writeHead(500);
					response.end();
					return;
				}
			}
		}

		// inefficient, kinda thrashes the db, but idc
		await Promise.all(allOldTriggers.map(async trigger => {
			if (allNewTriggers.some(t => t.emoji === trigger.emoji && t.roleID === trigger.roleID)) {
				return;
			}
			await db.collection('reactionRoles').deleteOne({
				emoji: trigger.emoji,
				roleID: trigger.roleID,
				channelID: tempChannelID,
			}).catch(log.warn);
		}));

		// create the new message text
		const categoryThings = [];
		const triggersContained = [];
		for (const category of json.categories) {
			const categoryLines = [];
			const triggersWithin = [];
			categoryLines.push(`**=== ${category.name} ===**`);
			for (const trigger of category.triggers) {
				triggersWithin.push(trigger);
				if (trigger.emoji.match(/^\d+$/)) {
					categoryLines.push(`<:a:${trigger.emoji}> <@&${trigger.roleID}>`);
				} else {
					categoryLines.push(`${trigger.emoji} <@&${trigger.roleID}>`);
				}
			}
			categoryThings.push(categoryLines);
			triggersContained.push(triggersWithin);
		}

		const messageTexts = [];
		const messageTextTriggers = [];
		// split the text up into chunks of <=2000 characters so Discord is happy
		// each category gets at least a message to itself
		for (const [i, categoryLines] of Object.entries(categoryThings)) {
			const categoryTriggers = triggersContained[i];
			while (categoryLines.length) {
				let catText = '';
				const textTriggers = [];
				while (categoryLines.length && catText.length + categoryLines[0].length <= 2000) {
					catText += `${categoryLines.shift()}\n`;
					if (categoryTriggers[0]) { // may be a category header line, which has no trigger associated with it
						textTriggers.push(categoryTriggers.shift());
					}
				}
				messageTexts.push(catText);
				messageTextTriggers.push(textTriggers);
			}
		}

		// this is such bullshit lmfao
		const offset = listMessages.length - messageTexts.length;
		const posOffset = Math.max(offset, 0);
		const negOffset = Math.min(offset, 0);

		const idToTriggers = {};

		const editPromises = listMessages.map(async (m, i) => {
			if (i - posOffset >= 0) {
				idToTriggers[m.id] = messageTextTriggers[i - posOffset];
				await m.edit(messageTexts[i - posOffset]);
			} else {
				await m.edit('.');
			}
		});
		const createPromises = [];
		for (let i = negOffset; i < 0; i += 1) {
			createPromises.push((async () => {
				const newM = await listChannel.createMessage(messageTexts[messageTexts.length + negOffset]);
				idToTriggers[newM.id] = messageTextTriggers[messageTexts.length + negOffset];
			})());
		}
		await Promise.all([...editPromises, ...createPromises]);

		await Promise.all(allNewTriggers.map(async trigger => {
			if (allOldTriggers.some(t => t.emoji === trigger.emoji && t.roleID === trigger.roleID)) {
				return;
			}
			const messageID = Object.entries(idToTriggers).find(([_id, triggers]) => triggers.some(t => t.emoji === trigger.emoji && t.roleID === trigger.roleID))[0];
			await db.collection('reactionRoles').insertOne({
				emoji: trigger.emoji,
				roleID: trigger.roleID,
				channelID: tempChannelID,
				guildID: config.TEMP_guildID,
				messageID,
			}).catch(log.warn);
		}));


		response.end();

		// for (const category of json.categories) {
		// 	for (const trigger of category.triggers) {
		// 		/* eslint-disable no-await-in-loop */ // yes I'm sure, I don't want message edit race conditions and I'm too lazy to do this right
		// 		const {emoji, roleID} = trigger;
		// 		const existing = await db.collection('reactionRoles').findOne({
		// 			emoji,
		// 			roleID,
		// 			guildID: config.TEMP_guildID,
		// 			channelID: TEMP_channelID,
		// 		});
		// 	}
		// }
	});
