module.exports = (Discord, client, message) => {
    if(message.author.bot) return;  
    if(!message.guild) return;
    if(!message.content.startsWith(client.PREFIX)) return;

    const args = message.content.slice(client.PREFIX.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd);

    if(command) command.execute(client, message, args)
}