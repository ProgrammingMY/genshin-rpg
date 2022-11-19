const variable = require('../variable.js');
const Discord = require('discord.js');

async function hunt (client, message, traveller, quantity) {
    const get_random_value = client.utils.get('get_random_value');
    const level_up = client.utils.get('level_up');
    let used_resin = quantity * variable.HUNT_COST;
    var today = new Date();
    var mora = variable.MORA_REWARD_MULTIPLIER * traveller.rank;
    var primo = variable.PRIMO_REWARD_MULTIPLIER * traveller.rank;
    var total_mora = 0;
    var total_primo = 0;
    var exp = variable.HUNT_EXP*quantity;

    // get rewards from hunt
    for (var i = 0; i < quantity; i++) {
        total_mora += await get_random_value (mora*(1 - variable.REWARD_RANGE), mora*(1 + variable.REWARD_RANGE));
        total_primo += await get_random_value (primo*(1 - variable.REWARD_RANGE), primo*(1 + variable.REWARD_RANGE));
    }

    // update traveller data
    traveller.resin -= used_resin;
    traveller.last_used_resin_time = today;
    traveller.mora += total_mora;
    traveller.primo += total_primo;

    // rewards list
    let reward_list = variable.MORA + `\`+${total_mora} mora\`` + '\n';
    reward_list += variable.PRIMO + `\`+${total_primo} primogems\`` + '\n';
    reward_list += variable.RESIN + `\`-${used_resin} resin\`` + '\n';
    reward_list += variable.EXP + `\`+${exp} exp\`` + '\n';

    let remaining_resin = variable.RESIN + `\`${traveller.resin}/300\``;

    let hunt_message = new Discord.MessageEmbed()
    .setColor('00FF00')
    .setTitle('Hunting Done!')
    .setDescription('You went hunting and receive following rewards')
    .addField('Rewards:' , reward_list)
    .addField('Resin remaining:' , remaining_resin);

    message.channel.send({ embeds: [hunt_message]} );

    // check if traveller levels up
    traveller = level_up(message, traveller, exp);

    return traveller;
}

module.exports = {
    name: 'hunt',
    //aliases
    description: `.hunt [number], Spend your resins to collect moras and primos. Enter [number] to repeat a number of times`,
    async execute(client, message, args) {
        if (!args[0]) var quantity = 1;
        else var quantity = args[0];
        
        // error checking
        if (!Number(quantity) && quantity != 'max') return message.channel.send('Incorrect input');
        if (quantity < 0) return message.channel.send('Incorrect input');

        var user = message.author;
        const load_traveller_data = client.utils.get('load_traveller_data');
        const save_traveller_data = client.utils.get('save_traveller_data');
        const get_current_resin = client.utils.get('get_current_resin');

        // load traveller data  if any
        var traveller = await load_traveller_data(user, message.guild.id);
        if (traveller == null) return console.log("You havent join the guild");
        traveller = await get_current_resin(traveller);

        // quickly burn all resin
        if (quantity == 'max') quantity = Math.floor(traveller.resin/variable.HUNT_COST);

        // not enough resin
        if (traveller.resin < (quantity * variable.HUNT_COST) || quantity == 0) return message.channel.send('Not enough resin');

        // get hunt rewards
        traveller = await hunt(client, message, traveller, quantity);

        // save latest traveller data
        save_traveller_data(user, traveller);
    }
}