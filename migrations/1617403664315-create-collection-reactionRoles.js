const {MongoClient} = require('mongodb');
const config = require('../config');

module.exports.up = async () => {
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(config.mongodb.databaseName);

	await db.createCollection('reactionRoles', {
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				required: [
					'guildID',
					'channelID',
					'messageID',
					'emoji',
					'roleID',
				],
				properties: {
					guildID: {
						bsonType: 'string',
					},
					channelID: {
						bsonType: 'string',
					},
					messageID: {
						bsonType: 'string',
					},
					emoji: {
						bsonType: 'string',
					},
					roleID: {
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

	await db.dropCollection('reactionRoles');
};
