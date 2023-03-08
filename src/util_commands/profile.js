const Discord = require('discord.js');
const variable = require('../variable.js');

function view_profile(client, message, user, traveller) {
    const progress_bar = client.utils.get('progress_bar');
    let stats_list = `:crossed_swords: ${traveller.atk} ❤️ ${traveller.hp} \n`;
    stats_list += `🛡️ ${traveller.def} 🏃 ${traveller.eva}%`;

    // exp bar
    let progress = progress_bar(traveller.exp, traveller.lvl * variable.NEXT_LEVEL_EXP, 10);
    let next_exp = traveller.lvl * variable.NEXT_LEVEL_EXP;

    let profile = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`${traveller.name}'s Profile`)
        .addFields(
            { name: 'Adventure', value: `Level: ${traveller.lvl}\n${progress}${variable.EXP} ${traveller.exp} of ${next_exp}` },
            { name: 'Stats', value: stats_list },
            { name: 'Currency', value: `${variable.MORA} ${traveller.mora} ${variable.RESIN}${traveller.resin}/300` }
        )
        .setThumbnail(user.avatarURL())


    message.channel.send({ embeds: [profile] });
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
        let traveller = await load_traveller_data(user, message.guild.id);
        if (traveller.length === 0) {
            return message.channel.send("You havent join the guild");
        }

        traveller = await get_current_resin(traveller);
        view_profile(client, message, user, traveller);

        // save latest traveller data
        if (await save_traveller_data(user, traveller)){
            return console.log(`Profile ${traveller.name} updated!`);
        } else {
            return console.log(`Unable to update ${traveller.name} data due to error!`);
        }
        
    }
}