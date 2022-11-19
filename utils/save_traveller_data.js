var AWS = require("aws-sdk");

// Use a DynamoDB Local endpoint
AWS.config.update({
    region: "Singapore",
    endpoint: "http://localhost:8080"
});

module.exports = async function (user, traveller) {
    var docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
        TableName: "Travellers",
        Item: {
            "guildid": traveller.guildid,
            "id": traveller.id,
            "data": traveller
        }
    };

    docClient.put(params, function (err) {
        if (err) {
            console.error("Unable to add traveller", err);
            return false;
        } else {
            console.log(`Successfully added ${traveller.name}`);
            return true;
        }
    });
};