// import database management system
var AWS = require("aws-sdk");

// Use a DynamoDB Local endpoint
AWS.config.update({
    region: "ap-southeast-1",
    accessKeyId: 'AKIA4LKF2CRSQ2SKO34S',
    secretAccessKey: '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'
});

// get all travellers data in the same guild
async function get_travellers_data(guildid) {
    return new Promise((resolve, reject) => {
        // connect to dynamodb client
        var docClient = new AWS.DynamoDB.DocumentClient();

        // query from the local secondary index
        var params = {
            TableName: 'Travellers',
            FilterExpression: 'guildid = :gid',
            ExpressionAttributeValues: {
                ':gid': guildid
            }
        };


        // query the data
        docClient.scan(params, function (err, data) {
            if (err) {
                console.error("Error when run rank.js\n", err);
                resolve(null);
            }
            else {
                if (data === null) {
                    resolve(null);
                }
                else {
                    resolve(data);
                }
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

        // travellers data not exists
        if (travellers_list === null || travellers_list === []) {
            return message.channel.send('Travellers data not exists')
        }

        var travellers = travellers_list.Items;
        // sort the leaderboard
        travellers.sort((a, b) => {
            if (a.lvl < b.lvl) return 1;
            if (a.lvl > b.lvl) return -1;
            return 0;
        })
        var total_travellers = travellers_list.Count;
        let spaces = ' ';
        let repeats = 0;
        let spacing = 30;

        // display the leaderboard
        let leaderboard_title = `${message.guild.name} Leaderboard`;
        let travellers_ranking = '';
        for (var i = 0; i < total_travellers; i++) {
            repeats = spacing - travellers[i].name.length;
            travellers_ranking += `${i + 1}. ` + travellers[i].name;
            travellers_ranking += `${spaces.repeat(repeats)}Rank ` + travellers[i].lvl + '\n';
        }

        message.channel.send(`\`\`\`css\n${leaderboard_title}\n\n${travellers_ranking}\`\`\``);
    }
}