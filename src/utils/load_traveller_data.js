const MongoClient = require('mongodb').MongoClient;
const { config } = require('dotenv');
config();

const mongo_client = new MongoClient(process.env.MONGO_URL);
const MONGO_DB = process.env.MONGO_DB;
const MONGO_COLLECTION = process.env.MONGO_COLLECTION;

module.exports = async function (user){
  // connect to mongo client
  const travellers = (mongo_client).db(MONGO_DB).collection(MONGO_COLLECTION);

  // find if the traveller already in the databse
  var query = { id: user.id };
  var traveller = await travellers.findOne(query);

  return traveller;
}