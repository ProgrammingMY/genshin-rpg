const fs = require('fs');
const dirs = ['Game_commands', 'Util_commands']

module.exports = (client, Discord) => {
    for(const dir of dirs){
        const command_files = fs.readdirSync(`./${dir}/`).filter(file => file.endsWith('.js'));

        for(const file of command_files){
            const command = require(`../${dir}/${file}`);
            if(command.name){
                client.commands.set(command.name, command);
            }else{
                continue;
            }
        }
    }
}