const Discord = require('discord.js');
const variable = require('../variable.js');

function view_profile(message, user, traveller) {
    let stats_list = `:crossed_swords: ${traveller.atk} ❤️ ${traveller.hp} \n`;
    stats_list += `🛡️ ${traveller.def} 🏃 ${traveller.eva}%`;


    let profile = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`${traveller.name}'s Adventure Profile`)
    .addFields(
        {name:'Adventure', value:`Rank: ${traveller.rank}`},
        {name:'Stats', value: stats_list},
        {name:'Currency', value:`${variable.MORA} ${traveller.mora} ${variable.PRIMO}${traveller.primo} ${variable.RESIN}${traveller.resin}/300`}
    )
    .setThumbnail(user.avatarURL())


    message.channel.send({ embeds: [profile]});
}

module.exports = {
    name: 'profile',
    aliases: ['p'],
    description: 'View your profile stats',
    async execute(client, message, args) {
        var user = message.author;
        const load_traveller_data = client.utils.get('load_traveller_data');
        const save_traveller_data = client.utils.get('save_traveller_data');
        const get_current_resin = client.utils.get('get_current_resin');

        // load traveller data  if any
        var traveller = await load_traveller_data(user);
        if (traveller == null) return message.channel.send("You havent join the guild");

        traveller = await get_current_resin(traveller);
        view_profile(message, user, traveller);

        // save latest traveller data
        save_traveller_data(user, traveller);
    }
}