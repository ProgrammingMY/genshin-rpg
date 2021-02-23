const Discord = require('discord.js');

// include other js files
const utility = require('./utility.js');
const adventure = require('./adventure.js');
const variable = require('./variable.js');
const gacha = require('./gacha.js');

function get_traveller_data(message) {
    var user = message.author;
    let guild = utility.loaddata(message);
    if (!guild) return false;
    if (!guild.traveller[user.id]) return false;  

    return guild.traveller[user.id];
}

function get_current_resin(traveller) {
    var today = new Date;
    var last_used_resin_time = new Date(traveller.last_used_resin_time);
    var new_resin = Math.floor((today - last_used_resin_time) / (variable.RESIN_REFRESH_RATE));

    // update traveller data
    traveller.resin += new_resin;
    traveller.last_used_resin_time = new Date;

    // if overcapped
    if (traveller.resin > 300) traveller.resin = 300;

    return traveller;
}

function create_traveller(message) {
    // load the database
    var guild = utility.loaddata(message);
    var user = message.author;

    // if server not registered yet
    if (!guild) {
        guild = {
            traveller: {},
            total_travellers: 0
        };
    }

    // if traveller is not registered yet
    if (!guild.traveller[user.id]) {
        guild.traveller[user.id] = {
            name: user.username,
            atk: 100,
            hp: 1000,
            crit_rate: 0,
            crit_dmg: 0,
            rank: 1,
            pity: 0,
            mora: 10000,
            primo: 1000,
            resin: 300,
            last_used_resin_time: new Date,
            daily: 1,
            last_used_boss_time: 0,
            last_used_daily_time: new Date,
            character_name: [],
            character: {},
        }

        // save the traveller data into a database
        utility.savedata(message, guild.traveller[user.id]);

        return message.channel.send(user.username + ` has joined the Benny's Adventure Team!`);
    } else
    return message.channel.send(`You already joined the Benny's Adventure Team!`);
}

function view_profile(message, traveller) {
    var user = message.author;

    let stats_list = `:crossed_swords: ${traveller.atk} ❤️ ${traveller.hp} \n`;
    stats_list += `C.Rate: ${traveller.crit_rate}% C.Dmg: ${traveller.crit_dmg}%`;


    let profile = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`${traveller.name}'s Adventure Profile`)
    .addFields(
        {name:'Adventure', value:`Rank: ${traveller.rank}`},
        {name:'Stats', value: stats_list},
        {name:'Currency', value:`${variable.MORA} ${traveller.mora} ${variable.PRIMO}${traveller.primo} ${variable.RESIN}${traveller.resin}/300`}
    )
    .setThumbnail(user.avatarURL())


    message.channel.send(profile);
}

// view inventory
function view_inventory(message, traveller) {
    var characters = traveller.character;
    var character_name = traveller.character_name;
    let character_list = '';
    let spaces = ' ';
    let repeats = 0;

    // get the list of the character of traveller has
    for (var i = 0; i < character_name.length; i++) {
        repeats = 10 - character_name[i].length;
        character_list += `\n${characters[character_name[i]].star}★ ` + character_name[i];
        character_list += `${spaces.repeat(repeats)}-\tConstellation: ${characters[character_name[i]].constellation}`;
    }

    message.channel.send(`\`\`\`css\n${traveller.name}'s Character List\n${character_list} \`\`\``);

}

// view leaderboard
function view_leaderboard (message) {
    let guild = utility.loaddata(message);
    if (!guild) return message.channel.send('There is no travellers in your guild');

    // get the guild info
    let travellers = guild.traveller;
    let travellers_list = [];
    let spaces = ' ';
    let repeats = 0;
    let spacing = 30;

    // get total travellers
    if (guild.total_travellers > 10) var total_travellers = 10;
    else var total_travellers = guild.total_travellers;

    for (var i = 0; i < total_travellers; i++) 
        travellers_list.push(travellers[Object.keys(travellers)[i]]);

    // sort the list based on rank
    travellers_list.sort(function(a, b){return b.rank - a.rank});


    // display the guild leaderboard
    let leaderboard_title = `${message.guild.name} Leaderboard`;
    let travellers_ranking = '';
    for (var i = 0; i < total_travellers; i++) {
        repeats = spacing - travellers_list[i].name.length;
        travellers_ranking += `${i+1}. ` + travellers_list[i].name;
        travellers_ranking += `${spaces.repeat(repeats)}Rank ` + travellers_list[i].rank + '\n';
    }

    message.channel.send(`\`\`\`css\n${leaderboard_title}\n\n${travellers_ranking}\`\`\``);
}

module.exports = {
    create_traveller: function(message) {
        create_traveller(message);
    },

    view_profile: function(message) {
        var traveller = get_traveller_data(message);
        if (!traveller) return message.channel.send('You havent register the adventure');;

        traveller = get_current_resin(traveller);
        view_profile(message, traveller);

        // save latest traveller data
        utility.savedata(message, traveller); 
    },

    claim_daily: function(message) {
        var traveller = get_traveller_data(message);
        if (!traveller) return message.channel.send('You havent register the adventure');;

        traveller = adventure.claim_daily(message, traveller);

        // save latest traveller data
        utility.savedata(message, traveller);   
    },

    hunt: function(message, quantity = 1) {
        // error checking
        if (!Number(quantity)) return message.channel.send('Incorrect input');
        if (quantity < 0) return message.channel.send('Incorrect input');

        var traveller = get_traveller_data(message);
        if (!traveller) return message.channel.send('You havent register the adventure');;

        // get current resin
        traveller = get_current_resin(traveller);

        // go to hunt
        traveller = adventure.hunt(message, traveller, quantity);

        // save latest traveller data
        utility.savedata(message, traveller); 
    },

    roll_character: function(message, quantity = 1) {
        // error checking
        if (!Number(quantity)) return message.channel.send('Incorrect input');
        if (quantity < 0) return message.channel.send('Incorrect input');

        var traveller = get_traveller_data(message);
        if (!traveller) return message.channel.send('You havent register the adventure');

        // roll character
        traveller = gacha.roll_character(message, traveller, quantity);

        // save latest traveller data
        utility.savedata(message, traveller); 
    },

    view_inventory: function(message) {
        var traveller = get_traveller_data(message);
        if (!traveller) return message.channel.send('You havent register the adventure');

        view_inventory(message, traveller);
    },

    boss_fight: function(message) {
        var traveller = get_traveller_data(message);
        if (!traveller) return message.channel.send('You havent register the adventure');

        let today = new Date();
        let traveller_time = new Date(traveller.last_used_boss_time);
        
        if (today - traveller_time < 10000){
        return message.channel.send('Please wait for 10 seconds before fight the boss again');}

        // get current resin
        traveller = get_current_resin(traveller);

        // initiate the boss fight
        traveller = adventure.boss_fight(message, traveller);

        // update the boss time
        traveller.last_used_boss_time = new Date();

        // save latest traveller data
        utility.savedata(message, traveller); 
    },

    roll_artifact: function(message, substats = 1) {
        // error checking
        if (!Number(substats)) return message.channel.send('Incorrect input');
        if (substats < 1 || substats > 4) return message.channel.send('Only 1 to 4 substats allowed');

        var traveller = get_traveller_data(message);
        if (!traveller) return message.channel.send('You havent register the adventure');

        // start roll artifact
        traveller = gacha.roll_artifact(message, traveller, substats);

        // save latest traveller data
        utility.savedata(message, traveller); 
    },

    view_leaderboard(message) {
        view_leaderboard(message);
    }
}