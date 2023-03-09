// query mongodb using moogose
const mongoose = require('mongoose');
const { mongoPath } = require('../config.json');

module.exports = {
    name: 'test',
    description: 'test',
    async execute(client, message, args) {
        mongoose.connect(mongoPath, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        }).then(() => {
            console.log('Connected to MongoDB');
            message.channel.send('pong');
        }).catch((err) => {
            console.log(err);
        });
    }
}

// query mongodb using mongodb


//test insert some value to mongodb
module.exports = {
    name: 'test',
    description: 'test',
    async execute(client, message, args) {
        if (err) throw err;
        console.log('Connected to MongoDB');


        const collection = mongoClient.db('mydatabase').collection('mycollection');
        collection.insertOne({ message: 'pong' });
        message.channel.send('pong');
    }
}


