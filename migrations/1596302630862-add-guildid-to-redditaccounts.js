const {MongoClient} = require('mongodb');
const config = require('../config');

module.exports.up = async () => {
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(config.mongodb.databaseName);

	await db.command({
		collMod: 'redditAccounts',
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				required: ['userID', 'guildID', 'redditName'],
				properties: {
					userID: {
						bsonType: 'string',
					},
					guildID: {
						bsonType: 'string',
					},
					redditName: {
						bsonType: 'string',
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

	await db.command({
		collMod: 'redditAccounts',
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				required: ['userID', 'redditName'],
				properties: {
					userID: {
						bsonType: 'string',
					},
					redditName: {
						bsonType: 'string',
					},
				},
			},
		},
	});
};
