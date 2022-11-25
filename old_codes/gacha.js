// import necessary library
const variable = require('./variable.js');
const Discord = require('discord.js');

// get character database
const fs = require('fs');
let rawdata = fs.readFileSync('./database/gacha.json');
const character_pool = JSON.parse(rawdata);


function select(list) {
    var item = list[Math.floor(Math.random() * list.length)];
    return item;
}

function get_random_value (min, max, range = 1, quality = 0) {
    min = Math.ceil((min + quality) * range);
    max = Math.floor((max + quality) * range);

    return Math.floor(Math.random() * (max - min) + min);
}

function get_stat_quality (mora) {
    let quality = 0;
    let range = 0;

    while (mora > 0) {
        range += 1;
        quality = (mora % 10);
        mora = Math.floor(mora / 10);
    }

    return [quality, range];
}

//roll artifact
function roll_artifact(message, traveller, mora) {
    let [quality, range] = get_stat_quality (mora);
    var substats_list = ['atk', 'hp', 'crit_rate', 'crit_dmg'];
    let new_hp = 0;
    let new_atk = 0;
    let new_crit_rate = 0;
    let new_crit_dmg = 0;
    let stats_list = '';

    for (var i = 0; i < 4; i++) {
        var index = Math.floor( Math.random() * substats_list.length);

        switch (substats_list[index]) {
            case 'atk':
                new_atk = get_random_value(variable.ARTIFACT_ATK[0], variable.ARTIFACT_ATK[1], range, quality/100);
                traveller.atk = Math.floor(traveller.atk * (1 + (new_atk/100)));
                stats_list += `\n\`${new_atk}% ATK\``;
            break;

            case 'hp':
                new_hp = get_random_value(variable.ARTIFACT_HP[0], variable.ARTIFACT_HP[1], range, quality/100);
                traveller.hp = Math.floor(traveller.hp * (1 + (new_hp/100))); 
                stats_list += `\n\`${new_hp}% HP\``; 
            break;

            case 'crit_rate':      
                new_crit_rate = get_random_value(variable.ARTIFACT_CRIT_RATE[0], variable.ARTIFACT_CRIT_RATE[1], range, quality/100);
                traveller.crit_rate += new_crit_rate;
                stats_list += `\n\`${new_crit_rate}% CRIT RATE\``;
            break;

            case 'crit_dmg':
                new_crit_dmg = get_random_value(variable.ARTIFACT_CRIT_DMG[0], variable.ARTIFACT_CRIT_DMG[1], range, quality/100);
                traveller.crit_dmg += new_crit_dmg;
                stats_list += `\n\`${new_crit_dmg}% CRIT DAMAGE\``;
            break;
        }
    };
    
    // update traveller stats 
    if (traveller.crit_rate < 0) traveller.crit_rate = 0;
    else if (traveller.crit_rate > 100) traveller.crit_rate = 100;
    if (traveller.crit_dmg < 0) traveller.crit_dmg = 0;
    

    let artifact_message = new Discord.MessageEmbed()
    .setTitle(`${traveller.name}'s new stats`)
    .addField('Stats Bonus', stats_list)
    .addField('Mora remaining:', `${variable.MORA} \`${traveller.mora}\``)

    message.channel.send(artifact_message);

    return traveller;
}

//roll character
function roll_character (message, traveller, quantity) {
    let chance_5 = 0;
    let new_character = '';
    let star = 0;
    let new_attack = 0;
    let new_hp = 0;
    let character_list = '';

    for (var i = 0; i < quantity; i++) {
        if (traveller.pity < 10) chance_5 = variable.CHANCE_5STAR;
        else chance_5 = 1;

        // lets roll
        var roll = Math.random();

        // get 5 star
        if (roll < chance_5) {
            traveller.pity = 0;
            new_character = select(character_pool.char_5star);
            star = 5;
            new_attack += variable.ATTACK_5STAR;
            new_hp += variable.HP_5STAR;
            character_list += '[5★] ' + new_character + ' ';
        } // get 4 star
        else {
            traveller.pity += 1;
            new_character = select(character_pool.char_4star);
            star = 4;
            new_attack += variable.ATTACK_4STAR;
            new_hp += variable.HP_4STAR;
            character_list += '[4★] ' + new_character + ' ';
        }

        // if the character is not existed yet
        if (!traveller.character[new_character]) {
            traveller.character_name.push(new_character);
            traveller.character[new_character] = {
                star: star,
                constellation: 0
            }
        }
        // if the character already existed
        else {
            traveller.character[new_character].constellation += 1;
        }
    }
    

    // update traveller data
    traveller.atk += new_attack;
    traveller.hp += new_hp;

    let new_stats = `:crossed_swords: \`+${new_attack} attack\`\n`;
    new_stats += `❤️ \`+${new_hp} hp\`\n`;

    let roll_message = new Discord.MessageEmbed()
    .setTitle('Roll Result')
    .setColor('BA55D3')
    .addField('Character', character_list)
    .addField('Stats bonus', new_stats)
    .addField('Primogems remaining:', `${variable.PRIMO} ${traveller.primo}`)

    message.channel.send(roll_message);

    return traveller;

}

module.exports = {
    roll_character: function (message, traveller, quantity = 1) {
        if (traveller.primo < (variable.PULL_COST * quantity)) {
            message.channel.send('not enough primo');
            return traveller;
        }

        let cost = variable.PULL_COST * quantity;
        traveller.primo -= cost;

        return roll_character (message, traveller, quantity);
    },

    roll_artifact: function (message, traveller, mora){
        if (traveller.mora < mora) {
            let artifact_prices = 'You have ' + variable.MORA + `\`${traveller.mora}\``;

            let artifact_message = new Discord.MessageEmbed()
            .addField('Insufficient mora', artifact_prices);

            message.channel.send(artifact_message);

            return traveller;
        }

        traveller.mora -= mora;

        return roll_artifact (message, traveller, mora);
    }
}