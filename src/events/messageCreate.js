module.exports = {
    name: 'messageCreate',
    once: false,
    execute: async (message, client) => {
        // check if the message is from a guild
        if (message.author.bot) return;
        if (!message.guild) return;
        if (!message.content.startsWith(client.PREFIX)) return;

        if (!message.member) message.member = await message.guild.fetchMember(message);
    
        const args = message.content.slice(client.PREFIX.length).split(/ +/);
        const cmd = args.shift().toLowerCase();
    
        const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));
    
        if (command) {
            try {
                await command.execute(client, message, args);
            } catch (error) {
                console.error(error);
                await message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
}