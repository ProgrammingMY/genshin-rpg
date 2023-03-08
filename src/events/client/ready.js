import { Client } from "discord.js";

const event = {
    name: 'ready',
    once: true,
    execute: (client) => {
        client.user.setActivity('.help to get started');
        console.log('Bouken bot is online!');
    }
}

export default event;