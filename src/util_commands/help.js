const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display all commands available'),
    async execute(client, message, args) {
        var command_list = '';
        var space = ' ';
        var max_spaces = 20;
        var repeats = 0;

        // loop through all commands
        client.commands.forEach(command => {
            repeats = max_spaces - command.data.name.length;
            command_list += `\n${client.PREFIX}${command.data.name}${space.repeat(repeats)}- ${command.data.description}`;
        });

        await message.reply(`\`\`\`List of commands\n${command_list}\`\`\``);
    }
}