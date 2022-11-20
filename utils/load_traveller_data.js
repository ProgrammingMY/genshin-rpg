var AWS = require("aws-sdk");

// Use a DynamoDB Local endpoint
AWS.config.update({
    region: "Singapore",
    endpoint: "http://localhost:8080"
});

module.exports = async function (user, guildid) {
    return new Promise(function (resolve, reject) {
        var docClient = new AWS.DynamoDB.DocumentClient();

        // set query parameters from user id
        const params = {
            ExpressionAttributeValues: {
                ':hashkey': guildid,
                ':rangekey': user.id
            },
            KeyConditionExpression: 'guildid = :hashkey and id = :rangekey',
            TableName: 'Travellers',
        };

        // query the data
        docClient.query(params, function (err, data) {
            if (err) {
                console.error("Unable to retrieve the data", err);
                resolve(null);
            }
            // when data exist
            else if (data.Items) {
                resolve(data.Items[0].data);
            }
            // data not exist
            else {
                resolve(null);
            }
        });
    })
};