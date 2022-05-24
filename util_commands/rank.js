// import database management system
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = "mongodb://localhost:27017/";
const MONGO_DB = "genshinDB";

module.exports = {
    name: 'rank',
    //aliases
    description: 'See where are you in the leaderboard!',
    async execute(client, message, args) {
        // connect to mongo client
        const mongo_client = MongoClient.connect(MONGO_URL);
        const travellers = (await mongo_client).db(MONGO_DB).collection("travellers");

        // update traveller data into the database
        var query = { guild_id: message.guild.id };
        var sorting = { sort: { rank: 1 }, projection: { _id:0, name: 1, rank: 1 } };
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
            travellers_ranking += `${spaces.repeat(repeats)}Rank ` + travellers_list[i].rank + '\n';
        }

        message.channel.send(`\`\`\`css\n${leaderboard_title}\n\n${travellers_ranking}\`\`\``);
    }
}