module.exports = {
    name: 'create',
    description: 'Create and new profile and join the game',
    async execute(client, message, args) {
        var user = message.author;
        const save_traveller_data = client.utils.get('save_traveller_data');
        const load_traveller_data = client.utils.get('load_traveller_data');

        // load traveller data  if any
        var traveller = await load_traveller_data(user, message.guild.id);
        if (traveller != null) return message.channel.send("You already joined the guild!");

        let today = new Date;

        // initialise a new data
        var traveller = {
            id: user.id,
            guildid: message.guild.id,
            name: user.username,
            atk: 100,
            hp: 1000,
            def: 10,
            eva: 5,
            lvl: 1,
            exp: 0,
            mora: 10000,
            resin: 300,
            last_used_resin_time: today.toISOString(),
            daily: 1,
            last_used_daily_time: today.toISOString(),
        }

        // update traveller data into the database
        save_traveller_data(user, traveller);
        return message.channel.send(`Hi ${traveller.name}, welcome!`);
    }
}