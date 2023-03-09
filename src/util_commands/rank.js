const MongoClient = require('mongodb').MongoClient;
const { config } = require('dotenv');
config();

const mongo_client = new MongoClient(process.env.MONGO_URL);
const MONGO_DB = process.env.MONGO_DB;
const MONGO_COLLECTION = process.env.MONGO_COLLECTION;

module.exports = {
    name: 'rank',
    //aliases
    description: 'See where are you in the leaderboard!',
    async execute(client, message, args) {
        // get all data in the same guild
        const travellers = (mongo_client).db(MONGO_DB).collection(MONGO_COLLECTION);
        if (travellers === null) {
            return message.channel.send('Travellers data not exists')
        }

        // query traveller data into the database
        var query = { guildid: message.guild.id };
        var sorting = { sort: { rank: 1 }, projection: { _id:0, name: 1, lvl: 1 } };
        var limit = 10;

        // list top 10 player
        var travellers_list = await travellers.find(query, sorting).limit(limit).toArray();
        let total_travellers = travellers_list.length;
        let spaces = ' ';
        let repeats = 0;
        let spacing = 30;

        // display the guild leaderboard
        let leaderboard_title = `${message.guild.name} Leaderboard`;
        let travellers_ranking = '';
        for (var i = 0; i < total_travellers; i++) {
            repeats = spacing - travellers_list[i].name.length;
            travellers_ranking += `${i+1}. ` + travellers_list[i].name;
            travellers_ranking += `${spaces.repeat(repeats)}Level ` + travellers_list[i].lvl + '\n';
        }

        message.channel.send(`\`\`\`css\n${leaderboard_title}\n\n${travellers_ranking}\`\`\``);
    }
}