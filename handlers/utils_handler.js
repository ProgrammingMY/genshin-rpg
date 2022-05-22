const fs = require('fs');

module.exports = (client, Discord) => {
    const utility_files = fs.readdirSync('./utils/').filter(file => file.endsWith('.js'));

    for(const file of utility_files){
        const utility = require(`../utils/${file}`);
        const utility_name = file.split('.')[0];
        client.utils.set(utility_name, utility);
    }
}