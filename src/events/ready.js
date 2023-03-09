// import { Client } from "discord.js";

module.exports = {
    name: 'ready',
    once: true,
    execute: (client) => {
        client.user.setActivity('.help to get started');
        console.log('Bouken bot is online!');
    }
};