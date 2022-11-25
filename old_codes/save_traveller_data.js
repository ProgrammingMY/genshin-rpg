// import database management system
// CREATE

const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = "mongodb://localhost:27017/";
const MONGO_DB = "genshinDB"

module.exports = async function (user, traveller){
    // connect to mongo client
    const mongo_client = MongoClient.connect(MONGO_URL);
    const travellers = (await mongo_client).db(MONGO_DB).collection("travellers");

    // update traveller data into the database
    var query = { id: user.id };
    var update = { $set: traveller }
    var option = { upsert: true };

    var traveller = await travellers.updateOne(query, update, option);

    return traveller;
}