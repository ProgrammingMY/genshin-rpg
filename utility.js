const Discord = require('discord.js');
const fs = require('fs');
const traveller_database = './database/traveller.json';
const traveller_database_backup = './database/traveller_backup.json';

// save a traveller data
async function save_traveller_data(message, new_traveller) {
    // put the new traveller object inside guild
    var guild = load_traveller_database();

    // if the guild is not registered
    if (!guild[message.guild.id]) {
        guild[message.guild.id] = {
            traveller: {},
            total_travellers: 0,
        }
    }

    // if new traveller profile is created
    if (!guild[message.guild.id].traveller[new_traveller.id])
        guild[message.guild.id].total_travellers += 1;

    // get the traveller latest data
    guild[message.guild.id].traveller[new_traveller.id] = new_traveller;

    let data = JSON.stringify(guild, null, 2);
    fs.writeFileSync(traveller_database, data);
}

// load the whole database
function load_traveller_database() {
    try {
        var rawdata = fs.readFileSync(traveller_database);
        var traveller_data = JSON.parse(rawdata);
    } catch(err) {
        fs.writeFileSync(traveller_database, '{}');
        var rawdata = fs.readFileSync(traveller_database);
        var traveller_data = JSON.parse(rawdata);
    }

    return traveller_data;
}

// load a traveller data
function load_traveller_data(message){
    let guild = load_traveller_database();
    if(!guild[message.guild.id]) return;
    if(!guild[message.guild.id].traveller[message.author.id]) return;

    return guild[message.guild.id];
}

// backup the database
function backup_database() {
    fs.copyFile(traveller_database, traveller_database_backup, (err) => {
        if (err) fs.writeFileSync('./error.log', err);;
    })
}

function get_help(message) {
    fs.readFile('./database/help.txt', 'utf8', function(err, data) {
        if (err) throw err;

        message.channel.send(`\`\`\`${data}\`\`\``);
    });
}

module.exports = {
    savedata: function (message, traveller) {
        save_traveller_data (message, traveller);
        backup_database();
    },

    loaddata: function (message) {
        return load_traveller_data (message);
    },

    get_help: function (message) {
        get_help(message);
    }
}
