import * as mongoose from 'mongoose';
import * as Q from 'q';

before(() => {
	(mongoose as any).Promise = Q.Promise;
	return (mongoose as any).connect('mongodb://localhost/lemon-js-test', {
		useMongoClient: true,
	});
});
