const { readdirSync } = require('fs');
const dirs = ['game_commands', 'util_commands']

module.exports = (client) => {
    for(const dir of dirs){
        const command_files = readdirSync(`./${dir}/`).filter(file => file.endsWith('.js'));

        for(const file of command_files){
            const command = require(`../${dir}/${file}`);
            
            if(command.data){
                client.commands.set(command.data.name, command);
                console.log(`Loaded command: ${command.data.name}`);
            }else{
                continue;
            }
        }
    }
}