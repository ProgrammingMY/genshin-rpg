// import database management system
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = "mongodb://localhost:27017/";
const MONGO_DB = "genshinDB"

module.exports = async function (user){
    // connect to mongo client
    const mongo_client = MongoClient.connect(MONGO_URL);
    const travellers = (await mongo_client).db(MONGO_DB).collection("travellers");

    // find if the traveller already in the databse
    var query = { id: user.id };
    var traveller = await travellers.findOne(query);

    return traveller;
}