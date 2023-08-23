const {MongoClient} = require('mongodb');

const {MONGODB_CONNECTION_URI, MONGODB_DATABASE} = process.env;

module.exports.up = async () => {
	const mongoClient = new MongoClient(MONGODB_CONNECTION_URI, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(MONGODB_DATABASE);

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
	const mongoClient = new MongoClient(MONGODB_CONNECTION_URI, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(MONGODB_DATABASE);

	await db.dropCollection('reminders');
};
