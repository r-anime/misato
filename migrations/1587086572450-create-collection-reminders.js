const {MongoClient} = require('mongodb');
const config = require('../config');

module.exports.up = async () => {
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(config.mongodb.databaseName);

	await db.createCollection('reminders', {
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				required: ['userID', 'channelID', 'requested', 'due', 'text'],
				properties: {
					userID: {
						bsonType: 'string',
					},
					channelID: {
						bsonType: 'string',
					},
					requested: {
						bsonType: 'date',
					},
					due: {
						bsonType: 'date',
					},
					text: {
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

	await db.dropCollection('reminders');
};
