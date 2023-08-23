const {MongoClient} = require('mongodb');
const {MONGODB_CONNECTION_URI, MONGODB_DATABASE} = process.env;

module.exports.up = async () => {
	const mongoClient = new MongoClient(MONGODB_CONNECTION_URI, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(MONGODB_DATABASE);

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
	const mongoClient = new MongoClient(MONGODB_CONNECTION_URI, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(MONGODB_DATABASE);

	await db.dropCollection('reactionRoles');
};
