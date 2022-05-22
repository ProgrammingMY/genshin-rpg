module.exports = {
    name: 'create',
    description: 'Create and new profile and join the game',
    async execute(client, message, args) {
        var user = message.author;
        const load_traveller_data = client.utils.get('load_traveller_data');
        const save_traveller_data = client.utils.get('save_traveller_data');

        // load traveller data  if any
        var traveller = await load_traveller_data(user);
        if (traveller != null) return message.channel.send("You already joined the guild!");

        // initialise a new data
        var traveller = {
            id: user.id,
            guild_id: message.guild.id,
            name: user.username,
            atk: 100,
            hp: 1000,
            def: 50,
            eva: 5,
            rank: 1,
            pity: 0,
            mora: 10000,
            primo: 1600,
            resin: 300,
            last_used_resin_time: new Date,
            daily: 1,
            last_used_boss_time: 0,
            last_used_daily_time: new Date,
            character_name: [],
            character: {},
        }

        // update traveller data into the database
        var result = save_traveller_data(user, traveller);
        message.channel.send(user.username + ` has joined the Benny's Adventure Team!`);
        return result;
    }
}