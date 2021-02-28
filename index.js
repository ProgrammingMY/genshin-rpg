const Discord = require('discord.js');
require('dotenv').config();

const bot = new Discord.Client();
const token = process.env.DISCORD_KEY; 
const PREFIX = '.';

const Game = require('./game.js');
const utility = require('./utility.js');

bot.on('ready', () => {
    bot.user.setActivity('.help to get started');
    console.log('weibot is online!');
});

bot.on('message', async message => {
    if(!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).split(/ +/);

    switch(args[0]) {
        case 'create':
            Game.create_traveller(message);
        break;

        case 'profile':
        case 'p':
            Game.view_profile(message);
        break;

        case 'daily':
            Game.claim_daily(message);
        break;

        case 'hunt':
            Game.hunt(message, args[1]);
        break;

        case 'pull':
            Game.roll_character(message, args[1]);
        break;

        case 'boss':
            Game.boss_fight(message);
        break;

        case 'char':
            Game.view_inventory(message);
        break;

        case 'gamba':
            Game.roll_artifact(message, args[1]);
        break;

        case 'rank':
            Game.view_leaderboard(message);
        break;

        case 'help':
            utility.get_help(message);
        break;
    }
})

bot.login(token);