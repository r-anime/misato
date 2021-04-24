const {MongoClient} = require('mongodb');
const config = require('../config');

module.exports.up = async () => {
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(config.mongodb.databaseName);

	await db.createCollection('rssFeeds', {
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				required: ['rssFeedName', 'rssFeedUrl', 'channelId', 'lastCheck'],
				properties: {
					rssFeedName: {
						bsonType: 'string',
					},
					rssFeedUrl: {
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

	await db.dropCollection('rssFeeds');
};
