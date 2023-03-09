const { readdirSync } = require("fs");
const { join } = require("path");
// import { Client } from 'discord.js';

module.exports = (client) => {
    let eventDir = join(__dirname, "../events");

    readdirSync(eventDir).forEach(dir => {
        if (!dir.endsWith(".js")) return;

        let event = require(`${eventDir}/${dir}`);
        // check if the event need only once
        event.once ? client.once(event.name, (...args) => event.execute(...args, client))
        :
        client.on(event.name, (...args) => event.execute(...args, client));

        console.log(`Loaded event: ${event.name}`);
    });
}