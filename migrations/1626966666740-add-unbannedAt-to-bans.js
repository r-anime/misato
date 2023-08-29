const {MongoClient} = require('mongodb');
const {MONGODB_CONNECTION_URI, MONGODB_DATABASE} = process.env;

module.exports.up = async () => {
	const mongoClient = new MongoClient(MONGODB_CONNECTION_URI, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(MONGODB_DATABASE);

	await db.command({
		collMod: 'bans',
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				required: ['userID', 'guildID', 'date', 'note'],
				properties: {
					userID: {
						bsonType: 'string',
						description: 'The ID of the user the ban applies to',
					},
					guildID: {
						bsonType: 'string',
						description: 'The ID of the guild the ban applies to',
					},
					modID: {
						bsonType: 'string',
						description: 'The ID of the user who created the ban',
					},
					date: {
						bsonType: 'date',
						description: 'The date the ban was created',
					},
					expirationDate: {
						bsonType: 'date',
						description: 'The date the ban should automatically expire, if any',
					},
					revokeDate: {
						bsonType: 'date',
						description: 'The date the ban was manually revoked through the unban command',
					},
					autoRevokeDate: {
						bsonType: 'date',
						description: 'The date the ban was automatically revoked by the expiration date passing',
					},
					note: {
						bsonType: 'string',
						description: 'The text of the notification sent to the user',
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

	await db.command({
		collMod: 'bans',
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
					revokeDate: {
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
