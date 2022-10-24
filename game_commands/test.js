const one_day = 1000*60*60*24;
const variable = require('../variable.js');
const Discord = require('discord.js');

module.exports = {
    name: 'test',
    description: 'Claim your daily rewards. Keep your streak to earn more rewards!',
    async execute(client, message, args) {
        var fight_message = new Discord.MessageEmbed()
        .setTitle('0')
        message.channel.send( {embeds: [fight_message]} ).then(embedMessage => {
            var counter = 0

            var i = setInterval(function(){
                let update_hp = new Discord.MessageEmbed()
                .setTitle(`${counter}`)
                .setDescription(`${message.author.id}`)
                embedMessage.edit( {embeds: [update_hp]} );
                counter += 1;

                if (counter == 5) {
                    clearInterval(i);
                }
            }, 1500);
        });
    }
}