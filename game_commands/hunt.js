const variable = require('../variable.js');
const Discord = require('discord.js');

async function hunt(client, message, traveller, quantity) {
    return new Promise((resolve, reject) => {
        const get_random_value = client.utils.get('get_random_value');
        let used_resin = quantity * variable.HUNT_COST;
        var today = new Date();
        var mora = variable.MORA_REWARD_MULTIPLIER * traveller.lvl;
        var total_mora = 0;
        var exp = variable.HUNT_EXP * quantity;

        // get rewards from hunt
        total_mora = get_random_value(mora * (1 - variable.REWARD_RANGE), mora * (1 + variable.REWARD_RANGE));
        total_mora *= quantity;

        // update traveller data
        traveller.resin -= used_resin;
        traveller.last_used_resin_time = today.toISOString();
        traveller.mora += total_mora;
        traveller.exp += exp;

        // rewards list
        let reward_list = variable.MORA + `\`+${total_mora} mora\`` + '\n';
        reward_list += variable.RESIN + `\`-${used_resin} resin\`` + '\n';
        reward_list += variable.EXP + `\`+${exp} exp\`` + '\n';

        let remaining_resin = variable.RESIN + `\`${traveller.resin}/300\``;

        let hunt_message = new Discord.MessageEmbed()
            .setColor('00FF00')
            .setTitle('Hunting Done!')
            .setDescription('You went hunting and receive following rewards')
            .addFields(
                { name: 'Rewards:', value: reward_list },
                { name: 'Resin remaining:', value: remaining_resin }
            )
        message.channel.send({ embeds: [hunt_message] });

        resolve(traveller);
    })

}

module.exports = {
    name: 'hunt',
    //aliases
    description: `.hunt [number], Spend your resins to collect moras and primos. Enter [number] to repeat a number of times`,
    async execute(client, message, args) {
        var quantity = args[0];
        if (!quantity) {
            quantity = 1
        }

        // error checking
        if (!Number(quantity) && quantity != 'max') return message.channel.send('Incorrect input');
        if (quantity < 0) return message.channel.send('Incorrect input');

        var user = message.author;
        const load_traveller_data = client.utils.get('load_traveller_data');
        const save_traveller_data = client.utils.get('save_traveller_data');
        const get_current_resin = client.utils.get('get_current_resin');
        const level_up = client.utils.get('level_up');

        // load traveller data  if any
        var traveller = await load_traveller_data(user, message.guild.id);
        if (traveller == null) return message.channel.send("You havent join the guild");
        traveller = await get_current_resin(traveller);

        // quickly burn all resin
        if (quantity == 'max') quantity = Math.floor(traveller.resin / variable.HUNT_COST);

        // not enough resin
        if (traveller.resin < (quantity * variable.HUNT_COST) || quantity == 0) {
            return message.channel.send('Not enough resin');
        }

        // get hunt rewards
        traveller = await hunt(client, message, traveller, quantity);

        // check if traveller levels up
        traveller = level_up(message, traveller);

        // save latest traveller data
        save_traveller_data(user, traveller);
    }
}