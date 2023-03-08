// read data from mongodb docker

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'myproject';
const client = new MongoClient(url);
client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  client.close();
});



// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://loqmanh0:Co0xqqStiQgspIoK@cluster0.mzkrq6y.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
