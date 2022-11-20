// import database management system
var AWS = require("aws-sdk");

// Use a DynamoDB Local endpoint
AWS.config.update({
    region: "Singapore",
    endpoint: "http://localhost:8080"
});

// get all travellers data in the same guild
async function get_travellers_data(guildid) {
    return new Promise((resolve, reject) => {
        // connect to dynamodb client
        var docClient = new AWS.DynamoDB.DocumentClient();

        // query from the local secondary index
        var params = {
            ExpressionAttributeValues: {
                ':hashkey': guildid
            },
            KeyConditionExpression: 'guildid = :hashkey',
            TableName: 'Travellers',
            IndexName: 'GuildRank',
            ScanIndexForward: false
        };


        // query the data
        docClient.query(params, function (err, data) {
            if (err) {
                console.error("Error when run rank.js", err);
                resolve(null);
            }
            else if (data.Items) {
                resolve(data);
            }
            else {
                resolve(null);
            }
        });
    });
}

module.exports = {
    name: 'rank',
    //aliases
    description: 'See where are you in the leaderboard!',
    async execute(client, message, args) {
        // get all data in the same guild
        var travellers_list = await get_travellers_data(message.guild.id);
        var travellers = travellers_list.Items;
        var total_travellers = travellers_list.Count;
        let spaces = ' ';
        let repeats = 0;
        let spacing = 30;

        // display the leaderboard
        let leaderboard_title = `${message.guild.name} Leaderboard`;
        let travellers_ranking = '';
        for (var i = 0; i < total_travellers; i++) {
            repeats = spacing - travellers[i].name.length;
            travellers_ranking += `${i+1}. ` + travellers[i].name;
            travellers_ranking += `${spaces.repeat(repeats)}Rank ` + travellers[i].lvl + '\n';
        }

        message.channel.send(`\`\`\`css\n${leaderboard_title}\n\n${travellers_ranking}\`\`\``);
    }
}