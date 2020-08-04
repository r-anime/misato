const {MongoClient} = require('mongodb');
const config = require('../config');

module.exports.up = async () => {
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(config.mongodb.databaseName);

	await db.createCollection('bans', {
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				required: ['userID', 'guildID', 'date', 'note'],
				properties: {
					userID: {
						bsonType: 'string',
					},
					guildID: {
						bsonType: 'string',
					},
					modID: {
						bsonType: 'string',
					},
					date: {
						bsonType: 'date',
					},
					expirationDate: {
						bsonType: 'date',
					},
					note: {
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

	await db.dropCollection('bans');
};
