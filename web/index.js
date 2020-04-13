const polka = require('polka');
const log = require('another-logger');
const {MongoClient} = require('mongodb');

const config = require('../config');

(async () => {
	// Set up MongoDB
	const mongoClient = new MongoClient(config.mongodb.url);
	await mongoClient.connect();
	const db = mongoClient.db(config.mongodb.databaseName);

	// Set up our app
	const app = polka();

	// Testing mongo stuff
	app.get('/', (request, response) => {
		response.end('Hello, world!');
	});

	const collection = db.collection('things');
	await collection.insertMany([
		{a: 1},
		{a: 2},
		{a: 3},
	]).then(log.info).catch(log.error);

	// Start the server
	app.listen(config.web.port, error => {
		if (error) {
			log.error(error);
			process.exit(1);
		}
		log.success(`Server listening on port ${config.web.port}`);
	});
})();
