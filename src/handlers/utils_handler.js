const fs = require('fs');

module.exports = (client, Discord) => {
    const utility_files = fs.readdirSync('./utils/').filter(file => file.endsWith('.js'));

    for(const file of utility_files){
        const utility = require(`../utils/${file}`);

        if (utility.name) {
            client.utils.set(utility.name, utility);
            console.log(`Loaded utility: ${utility.name}`);
        } else {
            continue;
        }
    }
}