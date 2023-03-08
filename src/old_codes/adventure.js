const variable = require('./variable.js');
const Discord = require('discord.js');

// game variables
const hunt_cost = variable.HUNT_COST;
const boss_cost = variable.BOSS_COST;
const mora_reward_multiplier = variable.MORA_REWARD_MULTIPLIER;
const primo_reward_multiplier = variable.PRIMO_REWARD_MULTIPLIER;
const reward_range = variable.REWARD_RANGE;

// daily reset
const one_day = 1000*60*60*24;

// progress bar
function progress_bar(value, max_value, size) {
    if (value < 0) value = 0;
    const percentage = value / max_value; // Calculate the percentage of the bar
    const progress = Math.round((size * percentage)); // Calculate the number of square caracters to fill the progress side.
    const emptyProgress = size - progress; // Calculate the number of dash caracters to fill the empty progress side.

    const progressText = '▇'.repeat(progress); // Repeat is creating a string with progress * caracters in it
    const emptyProgressText = '—'.repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
    const percentageText = Math.round(percentage * 100) + '%'; // Displaying the percentage of the bar

    const bar = '[' + progressText + emptyProgressText + ']' + percentageText + '\n'; // Creating the bar
    return bar;
}

function get_random_value (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min) + min);
}

function select(list) {
    var item = list[Math.floor(Math.random() * list.length)];
    return item;
}

function get_damage_value (attack, crit_rate = 0.5, crit_dmg = 1) {
    var damage = get_random_value(attack*(1-variable.ATTACK_RANGE), attack*(1+variable.ATTACK_RANGE));

    // if crits
    var roll = Math.random();

    if (roll < crit_rate) {
        damage = Math.floor(damage * (1 + crit_dmg));
    }

    return damage;
}

function hunt (message, traveller, quantity) {
    let used_resin = quantity * hunt_cost;
    var today = new Date();
    var mora = mora_reward_multiplier * traveller.rank;
    var primo = primo_reward_multiplier * traveller.rank;
    var total_mora = 0;
    var total_primo = 0;

    for (var i = 0; i < quantity; i++) {
        total_mora += get_random_value (mora*(1 - reward_range), mora*(1 + reward_range));
        total_primo += get_random_value (primo*(1 - reward_range), primo*(1 + reward_range));
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

    let remaining_resin = variable.RESIN + `\`${traveller.resin}/300\``;

    let hunt_message = new Discord.MessageEmbed()
    .setColor('00FF00')
    .setTitle('Hunting Done!')
    .setDescription('You went hunting with Bennett and receive following rewards')
    .addField('Rewards:' , reward_list)
    .addField('Resin remaining:' , remaining_resin)

    message.channel.send(hunt_message);

    return traveller;
}

function claim_daily(message, traveller) {
    // check daily
    var today = new Date();
    var daily_reset = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    var last_used_daily_time = new Date(traveller.last_used_daily_time);

    // check if streak
    var remaining_time = Math.floor((last_used_daily_time.getTime() - daily_reset.getTime()) / one_day);

    // daily reward already claimed
    if (remaining_time == 0) {
        let progress = progress_bar(traveller.daily, 10, 10);
        let daily_message = new Discord.MessageEmbed()
        .setColor('FF0000')
        .setTitle('Already claimed for today, please comeback tomorrow!')
        .addField('Current Daily Streak:', `${progress} ${traveller.daily} out of 10`)
        .setFooter('Daily resets at 00.00 GMT+8')
        message.channel.send(daily_message);

        return traveller;
    }
    // daily reward havent claimed for today
    else if (remaining_time == -1) {
        traveller.daily += 1;
        traveller.last_used_daily_time = today;

        // make sure streak max at 10
        if (traveller.daily <= 10) var streak = traveller.daily;
        else var streak = 10;
        var new_mora = Math.floor(streak * variable.MORA_DAILY_MULTIPLIER * traveller.rank);
        var new_primo = Math.floor(streak * variable.PRIMO_DAILY_MULTIPLIER * traveller.rank);
        var msg = 'You have succesfully claimed your daily rewards!';
        traveller.mora += new_mora;
        traveller.primo += new_primo;
    } 
    // daily reward streak missed
    else {
        traveller.daily = 1;
        traveller.last_used_daily_time = today;
        var new_mora = Math.floor(traveller.daily * variable.MORA_DAILY_MULTIPLIER * traveller.rank);
        var new_primo = Math.floor(traveller.daily * variable.PRIMO_DAILY_MULTIPLIER * traveller.rank);
        var msg = 'You lose the daily reward streak!'
        traveller.mora += new_mora;
        traveller.primo += new_primo;
    }

    let progress = progress_bar(traveller.daily, 10, 10);

    let reward_list = variable.MORA + `\`+${new_mora} mora\`` + '\n';
    reward_list += variable.PRIMO + `\`+${new_primo} primogems\`` + '\n';

    let daily_message = new Discord.MessageEmbed()
    .setColor('FFD700')
    .setTitle(msg)
    .addFields(
        {name:'Daily Rewards', value: reward_list},
        {name:'Current Daily Streak:', value:`${progress} ${traveller.daily} out of 10`}
    )
    .setFooter('Daily resets at 00.00 GMT+8')

    message.channel.send(daily_message);

    return traveller;
}

async function boss_fight_live (message, traveller, turns, traveller_hp_array, boss, rewards, fight_title) {
    // get boss and traveller stats
    var msg_fight;
    var interval = 1500;
    var boss_max_hp = boss.hp_array[0];
    var boss_hp;
    var boss_hp_bar;
    var traveller_hp;
    var traveller_hp_bar;

    var fight_message = new Discord.MessageEmbed()
    .setTitle(fight_title)
    
    await message.channel.send({embed: fight_message}).then(message => {
        msg_fight = message;
    });

    for (var i = 0; i < turns; i++){
        setTimeout(function (i) {
            // traveller turn
            boss_hp = boss.hp_array[i];
            if (boss_hp <= 0) {
                boss_hp = 0;
            }
            boss_hp_bar = progress_bar(boss_hp, boss_max_hp, 10);
            boss_hp_bar += `${boss_hp}/${boss_max_hp}`;      

            // boss turn
            traveller_hp = traveller_hp_array[i];
            if (traveller_hp <= 0){
                traveller_hp = 0;
            } 
            traveller_hp_bar = progress_bar(traveller_hp, traveller.hp, 10);
            traveller_hp_bar += `${traveller_hp}/${traveller.hp}`;
            
            let update_hp = new Discord.MessageEmbed()
            .setTitle(fight_title)
            .addField(`${traveller.name} HP`, traveller_hp_bar)
            .addField(`${boss.name} HP`, boss_hp_bar)
            msg_fight.edit(update_hp);

            if (traveller_hp == 0 || boss_hp == 0) {
                let reward_list = variable.MORA + `\`+${rewards[0]} mora\`\n`;
                reward_list += variable.PRIMO + `\`+${rewards[1]} primogems\`\n`;
                reward_list += variable.RESIN + `\`-${variable.BOSS_COST} resin\``;
                let update_hp = new Discord.MessageEmbed()
                .setTitle(fight_title)
                .addField(`${traveller.name} HP`, traveller_hp_bar)
                .addField(`${boss.name} HP`, boss_hp_bar)
                .addField(rewards[2], reward_list)
                .addField('Resin remaining:', `${variable.RESIN}\`${traveller.resin}/300\``)
                msg_fight.edit(update_hp);
            }

        }, interval * i,i);
    }
}

function boss_fight (traveller) {
    // get boss and traveller stats
    var boss_atk = variable.BOSS_ATK_MULTIPLIER * traveller.rank;
    var boss_hp = variable.BOSS_HP_MULTIPLIER * traveller.rank;
    var traveller_hp = traveller.hp;
    var turns = 1;
    var damage = 0;
    var traveller_hp_array = [traveller_hp];
    var rewards = [];
    let boss_name = select(variable.BOSS_NAME);
    let boss = {
        name: boss_name,
        hp_array: [boss_hp]
    };
    var fight_title = `Level ${traveller.rank} ${boss_name} fight`;

    while (true){
        turns += 1;
        // traveller turn
        damage = get_damage_value(traveller.atk, 0.5, 1);
        boss_hp -= damage;  
        boss.hp_array.push(boss_hp);

        // boss turn
        damage = get_damage_value(boss_atk);
        traveller_hp -= damage;
        traveller_hp_array.push(traveller_hp);

        if (boss_hp <= 0) {
            traveller.rank += 1;
            var new_primo = Math.floor(variable.PRIMO_BOSS_MULTIPLIER * traveller.rank);
            var new_mora = Math.floor(variable.MORA_BOSS_MULTIPLIER * traveller.rank);
            traveller.primo += new_primo;
            traveller.mora += new_mora;
            rewards = [new_mora, new_primo, 'You Win! Rank Up!'];
            return [traveller, turns, traveller_hp_array, boss, rewards, fight_title];
        };
        if (traveller_hp <= 0) {
            rewards = [0, 0, 'You Lose!'];
            return [traveller, turns, traveller_hp_array, boss, rewards, fight_title];
        };
    };

}

function traveller_fight (traveller, opponent) {
    // get boss and traveller stats
    var boss_hp = opponent.hp;
    var traveller_hp = traveller.hp;
    var turns = 1;
    var damage = 0;
    var traveller_hp_array = [traveller_hp];
    var rewards = [];
    let boss = {
        name: opponent.name,
        hp_array: [boss_hp]
    };
    var fight_title = `${traveller.name} VS ${opponent.name}`;

    while (true){
        turns += 1;
        // traveller turn
        damage = get_damage_value(traveller.atk, 0.5, 1);
        boss_hp -= damage;  
        boss.hp_array.push(boss_hp);

        // boss turn
        damage = get_damage_value(opponent.atk, 0.5, 1);
        traveller_hp -= damage;
        traveller_hp_array.push(traveller_hp);

        if (boss_hp <= 0) {
            let mora_reward_calc = (variable.PVP_REWARD - (traveller.rank - opponent.rank)) / 100;
            if (mora_reward_calc < 0) mora_reward_calc = 0.01;
            let new_mora = Math.floor(traveller.mora * mora_reward_calc);
            traveller.mora += new_mora;
            opponent.mora -= new_mora;
            rewards = [new_mora, 0, `${traveller.name} Wins!`];
            return [traveller, opponent, turns, traveller_hp_array, boss, rewards, fight_title];
        };
        if (traveller_hp <= 0) {
            let mora_reward_calc = (variable.PVP_REWARD - (opponent.rank - traveller.rank)) / 100;
            if (mora_reward_calc < 0) mora_reward_calc = 0.01;
            let new_mora = Math.floor(traveller.mora * mora_reward_calc);
            traveller.mora -= new_mora;
            opponent.mora += new_mora;
            if (traveller.mora < 0) traveller.mora = 0;
            rewards = [new_mora, 0, `${opponent.name} Wins!`];
            return [traveller, opponent, turns, traveller_hp_array, boss, rewards, fight_title];
        };
    };

}


module.exports = {
    hunt: function (message, traveller, quantity) {
        let used_resin =  quantity * hunt_cost;
        if (traveller.resin < used_resin) {
            message.channel.send('You don\'t have enough resin');
            return traveller;
        }

        return hunt (message, traveller, quantity);
    },

    claim_daily: function (message, traveller) {
        return claim_daily(message, traveller);
    },

    boss_fight: function(message, traveller) {
        if (traveller.resin < boss_cost) {
            message.channel.send(`You don't have enough resin. ${boss_cost} resin required`);
            return traveller;
        };

        traveller.resin -= boss_cost;

        var turns = 0;
        var traveller_hp_array = [];
        var rewards = [];

        [traveller, turns, traveller_hp_array, boss, rewards, fight_title] = boss_fight(traveller);

        boss_fight_live(message, traveller, turns, traveller_hp_array, boss, rewards, fight_title);

        return traveller;
    },

    traveller_fight: function(message, traveller, opponent) {
        var turns = 0;
        var traveller_hp_array = [];
        var rewards = [];

        [traveller, opponent, turns, traveller_hp_array, boss, rewards, fight_title] = traveller_fight(traveller, opponent);

        boss_fight_live(message, traveller, turns, traveller_hp_array, boss, rewards, fight_title);

        return [traveller, opponent];
    }
}