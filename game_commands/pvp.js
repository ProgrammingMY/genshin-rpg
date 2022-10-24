const variable = require('../variable.js');
const Discord = require('discord.js');

module.exports = {
    name: 'pvp',
    //aliases
    description: '.pvp @player, fight your fellow friend to see who is better!',
    async execute(client, message, args) {
        var user = message.author;
        var rival = message.mentions.members.first();
        const load_traveller_data = client.utils.get('load_traveller_data');
        const save_traveller_data = client.utils.get('save_traveller_data');
        const battle = client.utils.get('battle');
        
        // invalid input
        if (!args[0]) return message.channel.send("Please mention your opponent username");

        // load traveller data  if any
        var traveller = await load_traveller_data(user);
        if (traveller == null) return message.channel.send("You havent join the guild");
        var opponent = await load_traveller_data(rival);
        if (opponent == null) return message.channel.send("Your opponent havent join the guild");

        // get to the fight
        battle(client, message, traveller, opponent, function(result) {
            var new_mora = 0;
            var status =  'You Lose';
            var color = '7CFC00';
            var traveller_old_mora = traveller.mora;
            var opponent_old_mora = opponent.mora;

            // get reward if win
            if (result) {
                // traveller wins and set reward
                status =  `${traveller.name} Wins!`;
                new_mora = Math.floor(opponent.mora * variable.PVP_REWARD);
                traveller.mora += new_mora;
                opponent.mora -= new_mora;
            } else {
                // opponent wins and set reward
                status =  `${opponent.name} Wins!`;
                new_mora = Math.floor(traveller.mora * variable.PVP_REWARD);
                traveller.mora -= new_mora;
                opponent.mora += new_mora;
            }

            let reward_list = `${traveller.name}\n`;
            reward_list += variable.MORA + `\`${traveller_old_mora} -> ${traveller.mora}\`\n`;
            reward_list += `${opponent.name}\n`;
            reward_list += variable.MORA + `\`${opponent_old_mora} -> ${opponent.mora}\`\n`;

            let result_status = new Discord.MessageEmbed()
            .setColor(color)
            .setTitle(`${traveller.name} VS ${opponent.name}`)
            .addFields({ name: status, value: reward_list})
            message.channel.send({ embeds: [result_status] });

            // save latest traveller data
            save_traveller_data(user, traveller);

            // save latest opponent data
            save_traveller_data(rival, opponent);
        });
    }
}