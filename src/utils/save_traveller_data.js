const MongoClient = require('mongodb').MongoClient;
const { config } = require('dotenv');
config();

const mongo_client = new MongoClient(process.env.MONGO_URL);
const MONGO_DB = process.env.MONGO_DB;
const MONGO_COLLECTION = process.env.MONGO_COLLECTION;

module.exports = async function (user, traveller) {
    // connect to mongo client
    const travellers = (mongo_client).db(MONGO_DB).collection(MONGO_COLLECTION);

    // update traveller data into the database
    var query = { id: user.id };
    var update = { $set: traveller }
    var option = { upsert: true };

    var traveller = await travellers.updateOne(query, update, option);

    return traveller;
};