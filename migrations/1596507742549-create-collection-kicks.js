const {MongoClient} = require('mongodb');
const {MONGODB_CONNECTION_URI, MONGODB_DATABASE} = process.env;

module.exports.up = async () => {
	const mongoClient = new MongoClient(MONGODB_CONNECTION_URI, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(MONGODB_DATABASE);

	await db.createCollection('kicks', {
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
					note: {
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

	await db.dropCollection('kicks');
};
