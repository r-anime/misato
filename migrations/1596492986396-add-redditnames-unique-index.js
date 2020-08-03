const {MongoClient} = require('mongodb');
const config = require('../config');

module.exports.up = async () => {
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(config.mongodb.databaseName);

	await db.collection('redditAccounts').createIndex({userID: 1, guildID: 1, redditName: 1}, {unique: true});
};

module.exports.down = async () => {
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(config.mongodb.databaseName);

	await db.collection('redditAccounts').dropIndex({userID: 1, guildID: 1, redditName: 1}, {unique: true});
};
