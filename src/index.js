require('dotenv').config();
const { Client, Collection, Discord, GatewayIntentBits } = require('discord.js');
//const variable = require('./variable.js');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildWebhooks
    ]
});

client.commands = new Collection();
client.events = new Collection();
client.utils = new Collection();
client.PREFIX = '.';

['event_handler'].forEach(handler =>{
    require(`./handlers/${handler}`)(client, Discord);
})

client.variable = require('./variable.js');

client.login(process.env.DISCORD_KEY);