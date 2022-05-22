const variable = require('../variable.js');
const Discord = require('discord.js');

async function roll_artifact(client, message, traveller, mora) {
    const get_random_value = client.utils.get('get_random_value');
    var substats_list = ['atk', 'hp', 'def', 'eva'];
    let new_hp = 0;
    let new_atk = 0;
    let new_def = 0;
    let new_eva = 0;
    let range = 0;
    let stats_list = '';

    // avoid overshoot value
    if (mora > variable.MAX_MORA_ROLL) mora = variable.MAX_MORA_ROLL;

    // roll random upgrade/downgrade 4 times
    for (var i = 0; i < 4; i++) {
        switch (substats_list[i]) {
            case 'atk':
                range = mora/variable.MAX_MORA_ROLL*variable.ARTIFACT_ATK;
                new_atk = await get_random_value(-range, range);
                traveller.atk = Math.floor(traveller.atk * (1 + (new_atk/100)));
                stats_list += `\n\`${new_atk}% ATK\``;
            break;

            case 'hp':
                range = mora/variable.MAX_MORA_ROLL*variable.ARTIFACT_HP;
                new_hp = await get_random_value(-range, range);
                traveller.hp = Math.floor(traveller.hp * (1 + (new_hp/100))); 
                stats_list += `\n\`${new_hp}% HP\``; 
            break;

            case 'def': 
                range = mora/variable.MAX_MORA_ROLL*variable.ARTIFACT_DEF;
                new_def = await get_random_value(-range, range);
                traveller.def += new_def;
                stats_list += `\n\`${new_def}% DEF\``;
            break;

            case 'eva':
                range = mora/variable.MAX_MORA_ROLL*variable.ARTIFACT_EVA;
                new_eva = await get_random_value(-range, range);
                traveller.eva += new_eva;
                stats_list += `\n\`${new_eva}% EVASION\``;
            break;
        }
    };
    
    // update traveller stats 
    if (traveller.eva < 0) traveller.eva = 0;
    else if (traveller.eva > 100) traveller.eva = 100;

    // display result roll
    let artifact_message = new Discord.MessageEmbed()
    .setTitle(`${traveller.name}'s new stats`)
    .addField('Stats Bonus', stats_list)
    .addField('Mora remaining:', `${variable.MORA} \`${traveller.mora}\``)

    message.channel.send({ embeds: [artifact_message]} );

    return traveller;
}

module.exports = {
    name: 'gamba',
    aliases: ['g'],
    description: '.gamba [mora], Spend your moras to get random bonus stats up to 4 stats. Be careful the bonus can be negative too!',
    async execute(client, message, args) {
        var mora = args[0];
        // error checking
        if (!Number(mora)) return message.channel.send('Incorrect input');
        if (mora < 1) return message.channel.send('Incorrect input');

        var user = message.author;
        const load_traveller_data = client.utils.get('load_traveller_data');
        const save_traveller_data = client.utils.get('save_traveller_data');

        // load traveller data  if any
        var traveller = await load_traveller_data(user);
        if (traveller == null) return console.log("You havent join the guild");

        // not enough mora
        if (traveller.mora < mora) {
            let artifact_prices = 'You have ' + variable.MORA + `\`${traveller.mora}\``;

            let artifact_message = new Discord.MessageEmbed()
            .addField('Insufficient mora', artifact_prices);

            return message.channel.send({ embeds: [artifact_message] });
        }

        traveller.mora -= mora;
        traveller = await roll_artifact (client, message, traveller, mora);

        // save latest traveller data
        save_traveller_data(user, traveller);
    }
}