const {MongoClient} = require('mongodb');
const {MONGODB_CONNECTION_URI, MONGODB_DATABASE} = process.env;

module.exports.up = async () => {
	const mongoClient = new MongoClient(MONGODB_CONNECTION_URI, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(MONGODB_DATABASE);

	await db.collection('redditAccounts').createIndex({userID: 1, guildID: 1, redditName: 1}, {unique: true});
};

module.exports.down = async () => {
	const mongoClient = new MongoClient(MONGODB_CONNECTION_URI, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(MONGODB_DATABASE);

	await db.collection('redditAccounts').dropIndex({userID: 1, guildID: 1, redditName: 1}, {unique: true});
};
