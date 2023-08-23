const {MongoClient} = require('mongodb');
const {MONGODB_CONNECTION_URI, MONGODB_DATABASE} = process.env;

module.exports.up = async () => {
	const mongoClient = new MongoClient(MONGODB_CONNECTION_URI, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(MONGODB_DATABASE);

	await db.createCollection('rssFeeds', {
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

module.exports.down = async () => {
	const mongoClient = new MongoClient(MONGODB_CONNECTION_URI, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(MONGODB_DATABASE);

	await db.dropCollection('rssFeeds');
};
