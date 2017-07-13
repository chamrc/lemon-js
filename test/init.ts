import * as mongoose from 'mongoose';

before(() => {
	(mongoose as any).Promise = global.Promise;
	return (mongoose as any).connect('mongodb://localhost/mongoose-model', {
		useMongoClient: true,
	});
});
