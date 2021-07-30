import polka from 'polka';

import createLogger from 'another-logger';
const log = createLogger({label: 'web'});
import session from 'express-session';
import connectMongo from 'connect-mongo';
const MongoStore = connectMongo(session);

import config from '../../config';
import responseHelpers from './middleware/responseHelpers';
import logging from './middleware/logging';
import accessControl from './middleware/accessControl';
import auth from './routes/auth';
import api from './routes/api';

export default (mongoClient, db, discordClient) => {
	const app = polka();

	// Global middleware
	app.use(
		// Map session storage to MongoDB
		session({
			store: new MongoStore({
				client: mongoClient,
				dbName: config.mongodb.databaseName,
			}),
			secret: config.web.sessionSecret,
			saveUninitialized: false,
			resave: false,
		}),
		// Add our response helpers
		responseHelpers,
		// Log requests
		logging,
	);

	// In development, allow all cross-origin requests
	if (process.env.NODE_ENV !== 'production') {
		app.use(accessControl);
	}

	// Register sub-apps for API routes
	app.use('/auth', auth);
	app.use('/api', api(db, discordClient));

	// Start the server
	app.listen(config.web.port, error => {
		if (error) {
			log.error(error);
			process.exit(1);
		}
		log.success(`Server listening on port ${config.web.port}`);
	});
};
