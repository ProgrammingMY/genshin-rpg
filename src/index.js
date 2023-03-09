const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { config } = require('dotenv');
const { readdirSync } = require("fs");
config();

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
client.variable = require('./variable.js');
client.PREFIX = '.';

['event_handler', 'command_handler', 'utils_handler'].forEach(handler =>{
    require(`./handlers/${handler}`)(client);
})

client.login(process.env.DISCORD_KEY);