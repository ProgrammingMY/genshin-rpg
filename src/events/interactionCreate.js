// module exports interactionCreate

module.exports =  {
    name: 'interactionCreate',
    once: false,
    execute: async (client, interaction) => {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(client, interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }

    }

}





// module.exports = (Discord, client, message) => {
//     if (message.author.bot) return;
//     if (!message.guild) return;
//     if (!message.content.startsWith(client.PREFIX)) return;

//     const args = message.content.slice(client.PREFIX.length).split(/ +/);
//     const cmd = args.shift().toLowerCase();

//     const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));

//     if (command) command.execute(client, message, args)
// }