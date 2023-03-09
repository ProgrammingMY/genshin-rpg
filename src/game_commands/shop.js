
const variable = require('../variable.js');
const { Discord, EmbedBuilder } = require('discord.js');

function update_traveller_attribute(save_traveller_data, message, items, selection, traveller) {
    var user = message.author;
    var item = items[selection];
    var stats_list = '';

    //store old attribute
    var old_atk = traveller.atk;
    var old_def = traveller.def;
    var old_hp = traveller.hp;
    var old_eva = traveller.eva;
    var old_mora = traveller.mora;
    var old_resin = traveller.resin;

    // update traveller
    traveller.atk += Math.ceil(traveller.atk * (item.atk / 100));
    traveller.def += Math.ceil(traveller.def * (item.def / 100));
    traveller.hp += Math.ceil(traveller.hp * (item.hp / 100));
    traveller.eva = (traveller.eva + item.eva) < 0 ? 0 : traveller.eva += item.eva;
    traveller.eva = (traveller.eva) > 90 ? 90 : traveller.eva;
    traveller.mora -= item.mora;
    traveller.resin -= variable.SHOP_COST;

    // upgrade message
    stats_list += `\n\`ATK: ${old_atk} -> ${traveller.atk}\``;
    stats_list += `\n\`DEF: ${old_def} -> ${traveller.def}\``;
    stats_list += `\n\`HP: ${old_hp} -> ${traveller.hp}\``;
    stats_list += `\n\`EVASION: ${old_eva} -> ${traveller.eva}\``;
    stats_list += `\n ${variable.MORA} \`${old_mora} -> ${traveller.mora}\``;
    stats_list += `\n ${variable.RESIN} \`${old_resin} -> ${traveller.resin}\``;


    // send update embeds
    const new_result_embed = new EmbedBuilder()
        .setColor('FFD700')
        .addFields(
            { name: `New stats for ${traveller.name}:`, value: stats_list }
        )
    message.channel.send({ embeds: [new_result_embed] });

    // save latest traveller data
    save_traveller_data(user, traveller);

    return;
}

module.exports = {
    name: 'shop',
    description: 'Access shop to buy upgrades for you!',
    async execute(client, message, args) {
        // include necessary function
        var user = message.author;
        const get_random_value = client.utils.get('get_random_value');
        const load_traveller_data = client.utils.get('load_traveller_data');
        const save_traveller_data = client.utils.get('save_traveller_data');
        const get_current_resin = client.utils.get('get_current_resin');

        // load traveller data  if any
        var traveller = await load_traveller_data(user, message.guild.id);
        if (traveller == null) return message.channel.send("You havent join the guild");
        traveller = await get_current_resin(traveller);

        // check if enough resin
        if (traveller.resin < variable.SHOP_COST) {
            return message.channel.send(`You do not have enough resin. ${variable.RESIN} ${variable.SHOP_COST} required`);
        }

        // create 3 items with attributes
        var itemA = {};
        var itemB = {};
        var itemC = {};
        var items = [itemA, itemB, itemC];

        // randomise all the atrributes
        let items_att = [];
        items.forEach(item => {
            let attributes = '';
            item.atk = get_random_value(0, variable.ARTIFACT_ATK);
            attributes += ` :crossed_swords: \`+${item.atk}%\``;

            item.def = get_random_value(0, variable.ARTIFACT_DEF);
            attributes += ` 🛡️ \`+${item.def}%\``;

            item.hp = get_random_value(0, variable.ARTIFACT_HP);
            attributes += ` ❤️ \`+${item.hp}%\``;

            item.eva = get_random_value(-variable.ARTIFACT_EVA, variable.ARTIFACT_EVA);
            attributes += ` 🏃 \`${(item.eva < 0 ? "" : "+")}${item.eva}%\``;

            item.mora = Math.floor((get_random_value(variable.LOW_PRICE, variable.HIGH_PRICE)/100)*traveller.mora);

            items_att.push(attributes);
        });

        // display all 3 items with attributes
        let items_list = new EmbedBuilder()
            .setTitle(`Hi ${traveller.name}! Choose one item below or random`)
            .addFields(
                { name: `Item 1 : ${variable.MORA} \`${items[0].mora}\``, value: items_att[0] },
                { name: `Item 2 : ${variable.MORA} \`${items[1].mora}\``, value: items_att[1] },
                { name: `Item 3 : ${variable.MORA} \`${items[2].mora}\``, value: items_att[2] },
            )

        message.channel.send({ embeds: [items_list] }).then((message) => {
            message.react('1️⃣')
                .then(() => message.react('2️⃣'))
                .then(() => message.react('3️⃣'))
                .then(() => message.react('*️⃣'));

            const filter = (reaction, input) => {
                return ['1️⃣', '2️⃣', '3️⃣', '*️⃣'].includes(reaction.emoji.name) && input.id === user.id;
            };

            // get input from user tru reactions
            message.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first();

                    switch (reaction.emoji.name) {
                        case '1️⃣':
                            update_traveller_attribute(save_traveller_data, message, items, 0, traveller);
                            break;

                        case '2️⃣':
                            update_traveller_attribute(save_traveller_data, message, items, 1, traveller);
                            break;

                        case '3️⃣':
                            update_traveller_attribute(save_traveller_data, message, items, 2, traveller);
                            break;

                        case '*️⃣':
                            var number = get_random_value(0, 2);
                            update_traveller_attribute(save_traveller_data, message, items, number, traveller);
                            break;
                    }
                })
                .catch(collected => {
                    var number = get_random_value(0, 2);
                    update_traveller_attribute(save_traveller_data, message, items, number, traveller);
                });
        });

        return;
    }
}