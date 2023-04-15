const variable = require('../variable.js');
const { Discord, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boss')
        .setDescription('Spend your resin to challenge the boss to earn tons of experience!'),
    async execute(client, message, args) {
        var user = message.author;
        const load_traveller_data = client.utils.get('load_traveller_data');
        const save_traveller_data = client.utils.get('save_traveller_data');
        const get_current_resin = client.utils.get('get_current_resin');
        const battle = client.utils.get('battle');

        // load traveller data  if any
        var traveller = await load_traveller_data(user, message.guild.id);
        if (traveller == null) return console.log("You havent join the guild");
        traveller = await get_current_resin(traveller);

        // not enough resin
        if (traveller.resin < variable.BOSS_COST) {
            return message.channel.send(`You don't have enough resin. ${variable.RESIN} ${variable.BOSS_COST} resin required`);
        };

        // get boss data
        let boss_name = variable.BOSS_NAME[Math.floor(Math.random() * variable.BOSS_NAME.length)];
        var boss = {
            name: boss_name,
            atk: variable.BOSS_ATK_MULTIPLIER * traveller.lvl,
            hp: variable.BOSS_HP_MULTIPLIER * traveller.lvl,
            def: variable.BOSS_DEF_MULTIPLIER * traveller.lvl,
            eva: variable.BOSS_EVASION
        }
        // get to the fight
        battle(client, message, traveller, boss, function(result) {
            const level_up = client.utils.get('level_up');
            var new_mora = 0;
            var new_exp = 0;
            var status =  'You Lose';
            var color = 'FF0000';
            traveller.resin -= variable.BOSS_COST;

            // get reward if win
            if (result) {
                status =  'You Win and Ranked Up!';
                color = '7CFC00';
                new_mora = Math.ceil(variable.MORA_BOSS_MULTIPLIER * traveller.lvl);
                new_exp = (Math.ceil(traveller.lvl/10))*variable.BOSS_EXP_REWARD;
                traveller.mora += new_mora;
                traveller.exp += new_exp;
            }

            let reward_list = variable.MORA + `\`+${new_mora} mora\`\n`;
            reward_list += variable.EXP + `\`+${new_exp} exp\`\n`;
            reward_list += variable.RESIN + `\`-${variable.BOSS_COST} resin\``;

            let result_status = new EmbedBuilder()
            .setColor(color)
            .setTitle(`${traveller.name} VS ${boss.name}`)
            .addFields(
                { name: status, value: reward_list }, 
                { name:'Resin remaining:', value: `${variable.RESIN}\`${traveller.resin}/300\`` }
            )
            message.channel.send( {embeds: [result_status]} );

            // check if traveller levels up
            traveller = level_up(message, traveller);

            // save latest traveller data
            save_traveller_data(user, traveller);
        });
    }
}