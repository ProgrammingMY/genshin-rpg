const one_day = 1000*60*60*24;
const variable = require('../variable.js');
const Discord = require('discord.js');

module.exports = {
    name: 'daily',
    description: 'Claim your daily rewards. Keep your streak to earn more rewards!',
    async execute(client, message, args) {
        var user = message.author;
        const load_traveller_data = client.utils.get('load_traveller_data');
        const save_traveller_data = client.utils.get('save_traveller_data');
        const progress_bar = client.utils.get('progress_bar');

        // load traveller data  if any
        var traveller = await load_traveller_data(user, message.guild.id);
        if (traveller == null) return console.log("You havent join the guild");

        // check daily
        var today = new Date();
        var daily_reset = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        var last_used_daily_time = new Date(traveller.last_used_daily_time);

        // check if streak
        var remaining_time = Math.floor((last_used_daily_time.getTime() - daily_reset.getTime()) / one_day);

        // daily reward already claimed
        if (remaining_time == 0) {
            var streak = 0;
            var new_mora = Math.ceil(streak * variable.MORA_DAILY_MULTIPLIER * traveller.lvl);
            var new_exp = Math.ceil(streak * variable.EXP_DAILY_MULTIPLIER * traveller.lvl);
            var msg = 'Already claimed for today, please comeback tomorrow!';
        }
        // daily reward havent claimed for today
        else if (remaining_time == -1) {
            traveller.daily += 1;
            traveller.last_used_daily_time = today;
            var streak = traveller.daily;
            var new_mora = Math.ceil(streak * variable.MORA_DAILY_MULTIPLIER * traveller.lvl);
            var new_exp = Math.ceil(streak * variable.EXP_DAILY_MULTIPLIER * traveller.lvl);
            var msg = 'You have succesfully claimed your daily rewards!';
            traveller.mora += new_mora;
            traveller.exp += new_exp;
        } 
        // daily reward streak missed
        else {
            traveller.daily = 1;
            traveller.last_used_daily_time = today;
            var streak = traveller.daily;
            var new_mora = Math.ceil(streak * variable.MORA_DAILY_MULTIPLIER * traveller.lvl);
            var new_exp = Math.ceil(streak * variable.EXP_DAILY_MULTIPLIER * traveller.lvl);
            var msg = 'You lose the daily reward streak!'
            traveller.mora += new_mora;
            traveller.exp += new_exp;
        }

        let progress = progress_bar(traveller.daily, 10, 10);

        let reward_list = variable.MORA + `\`+${new_mora} mora\`` + '\n';

        let daily_message = new Discord.MessageEmbed()
        .setColor('FFD700')
        .setTitle(msg)
        .addFields(
            {name:'Daily Rewards', value: reward_list},
            {name:'Current Daily Streak:', value:`${progress} Total day(s): ${traveller.daily}`}
        )
        .setFooter({ text: 'Daily resets at 00.00 GMT+8' })

        message.channel.send({ embeds: [daily_message]});

        // save latest traveller data
        save_traveller_data(user, traveller);
    }
}