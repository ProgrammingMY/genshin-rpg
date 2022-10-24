require('dotenv').config();
const Discord = require('discord.js');
//const variable = require('./variable.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES","MESSAGE_CONTENT","GUILD_MEMBERS"] });

client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.utils = new Discord.Collection();
client.PREFIX = '.';

['command_handler', 'event_handler', 'utils_handler'].forEach(handler =>{
    require(`./handlers/${handler}`)(client, Discord);
})

client.variable = require('./variable.js');

client.login(process.env.DISCORD_KEY);