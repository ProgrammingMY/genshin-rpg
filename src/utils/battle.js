const variable = require('../variable.js');
const { Discord, EmbedBuilder } = require('discord.js');

function get_damage_value (traveller, opponent) {
    // 50/50 chance to double damage
    var crit_rate = 0.5;
    var crit_dmg = 1;
    var damage = traveller.atk - opponent.def;
    var logs = '';

    // if crits
    var roll = Math.random();
    if (roll < crit_rate) {
        damage = Math.floor(damage * (1 + crit_dmg));
        logs += `${traveller.name} lands a crit. `;
    }

    // if opponent evades
    roll = Math.random();
    if (roll < opponent.eva/100) {
        damage = 0;
        logs += `${opponent.name} evade. `;
    }

    logs += `${traveller.name} deals ${damage} `;

    return [damage, logs];
}

module.exports = function (client, message, traveller, opponent, callback){
    return new Promise(function (resolve, reject) {
        // get required function
        const progress_bar = client.utils.get('progress_bar');

        // get the player, opponent and game stats
        var fight_title = `${traveller.name} VS ${opponent.name}`;
        var interval = 1500; //1.5 seconds each turn
        var opponent_max_hp = opponent.hp;
        var opponent_hp = opponent_max_hp;
        var opponent_hp_bar;
        var opponent_logs = '';
        var traveller_max_hp = traveller.hp;
        var traveller_hp =  traveller_max_hp;
        var traveller_hp_bar;
        var traveller_logs = '';

        // send fight live update
        var fight_message = new EmbedBuilder()
        .setTitle(fight_title)
        message.channel.send( {embeds: [fight_message]} ).then(embedMessage => {
            var i = setInterval(function(){
                // traveller turn
                [damage, traveller_logs] = get_damage_value(traveller, opponent);
                opponent_hp -= damage;
                if (opponent_hp <= 0) {
                    opponent_hp = 0;
                }
                opponent_hp_bar = progress_bar(opponent_hp, opponent_max_hp, 10);
                opponent_hp_bar += `${opponent_hp}/${opponent_max_hp}`;      
    
                // boss turn
                [damage, opponent_logs] = get_damage_value(opponent, traveller);
                traveller_hp -= damage;
                if (traveller_hp <= 0){
                    traveller_hp = 0;
                } 
                traveller_hp_bar = progress_bar(traveller_hp, traveller_max_hp, 10);
                traveller_hp_bar += `${traveller_hp}/${traveller_max_hp}`;
                
                let update_hp = new EmbedBuilder()
                .setTitle(fight_title)
                .addFields(
                    { name: `${traveller.name} HP`, value: traveller_hp_bar },
                    { name: `${opponent.name} HP`, value: opponent_hp_bar }
                )
                .setDescription(`${traveller_logs}\n${opponent_logs}`)
                embedMessage.edit( {embeds: [update_hp]} );
    
    
                if (opponent_hp === 0) {
                    clearInterval(i);
                    callback(true);
                }
                else if (traveller_hp === 0) {
                    clearInterval(i);
                    callback(false);
                }
            }, interval);
        });  
    })
}