const Discord = require('discord.js');
const MongoClient = require('mongodb').MongoClient;

const client = new Discord.Client();
const mongoClient = new MongoClient("mongodb+srv://loqmanh0:Co0xqqStiQgspIoK@cluster0.mzkrq6y.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });


//test insert some value to mongodb
module.exports = {
    name: 'test',
    description: 'test',
    async execute(client, message, args) {
        if (err) throw err;
        console.log('Connected to MongoDB');


        const collection = mongoClient.db('mydatabase').collection('mycollection');
        collection.insertOne({ message: 'pong' });
        message.reply('pong');
    }
}


