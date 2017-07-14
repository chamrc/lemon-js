import * as mongoose from 'mongoose';
import * as Q from 'q';

before(() => {
	(mongoose as any).Promise = Q.Promise;
	let mongoUri = process.env.MONGO_URL || 'mongodb://localhost:27017/lemon-js-test';
	return (mongoose as any).connect(mongoUri, {
		useMongoClient: true
	});
});
