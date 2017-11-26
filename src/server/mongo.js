const mongoose = require('mongoose');
/**
 * Set to Node.js native promises
 * Per http://mongoosejs.com/docs/promises.html
 */
mongoose.Promise = global.Promise;

const envFile = './env/' + (process.env.NODE_ENV || 'development');
console.log(`reading env file ${envFile}`);
const env = require(envFile);
console.log(`env file contains cosmos settings = ${!!env.cosmos.accountName}`);

// Cosmos DB Connection String
// eslint-disable-next-line max-len
const mongoUri = `mongodb://${env.cosmos.accountName}:${env.cosmos.key}@${env.cosmos
  .accountName}.documents.azure.com:${env.cosmos.port}/${env.cosmos
    .databaseName}?ssl=true`; //&replicaSet=globaldb`;

// Local MongoDB Connection String
// const mongoUri = `mongodb://localhost:27017/my-heroes`;

function connect() {
  mongoose.set('debug', true);
  return mongoose.connect(mongoUri, { useMongoClient: true });
}

module.exports = {
  connect,
  mongoose
};
