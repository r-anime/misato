const {MongoClient} = require('mongodb');
const config = require('../config');

module.exports.up = async () => {
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(config.mongodb.databaseName);

	await db.createCollection('messageFilters', {
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				required: ['guildID', 'rule'],
				properties: {
					guildID: {
						bsonType: 'string',
					},
					rule: {
						bsonType: 'object',
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

	await db.dropCollection('messageFilters');
};
