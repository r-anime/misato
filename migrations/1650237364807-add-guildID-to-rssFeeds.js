const {MongoClient} = require('mongodb');
const config = require('../config');

module.exports.up = async () => {
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(config.mongodb.databaseName);

	// Update validator to add guildId property
	await db.command({
		collMod: 'rssFeeds',
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				required: ['name', 'url', 'guildId', 'channelId', 'lastCheck'],
				properties: {
					name: {
						bsonType: 'string',
					},
					url: {
						bsonType: 'string',
					},
					guildId: {
						bsonType: 'string',
					},
					channelId: {
						bsonType: 'string',
					},
					lastCheck: {
						bsonType: 'date',
					},
				},
			},
		},
	});
};

module.exports.down = async () => {
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(config.mongodb.databaseName);

	// Drop guildID from validator
	await db.command({
		collMod: 'rssFeeds',
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				required: ['name', 'url', 'channelId', 'lastCheck'],
				properties: {
					name: {
						bsonType: 'string',
					},
					url: {
						bsonType: 'string',
					},
					channelId: {
						bsonType: 'string',
					},
					lastCheck: {
						bsonType: 'date',
					},
				},
			},
		},
	});
};