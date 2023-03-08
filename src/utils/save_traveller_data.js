module.exports = async function (user, traveller) {
    var docClient = new AWS.DynamoDB.DocumentClient();
    console.log(traveller);

    // set parameters to save in the database
    const params = {
        TableName: "Travellers",
        Item: {
            "id": traveller.id,
            "guildid": traveller.guildid,
            "lvl": traveller.lvl,
            "name": traveller.name,
            "data": traveller
        }
    };

    // store the data
    docClient.put(params, function (err) {
        if (err) {
            console.error("Unable to add traveller\n", err);
            return false;
        } else {
            console.log(`Successfully added ${traveller.name}`);
            return true;
        }
    });
};