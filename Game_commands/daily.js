module.exports = {
    name: 'abyss',
    description: 'Display remaining time before abyss reset',
    async execute(client, message, args) {
        // get current time
        var today = new Date();
        var abyss1 = new Date(today.getFullYear(), today.getMonth() + 1, 1, 4, 0, 0);
        var abyss2 = new Date(today.getFullYear(), today.getMonth(), 16, 4, 0, 0);

        // first week
        if (today.getDate() <= abyss2.getDate()) {
            get_remaining_time(message, today, abyss2);

        // second week
        } else {
            get_remaining_time(message, today, abyss1);
        }
    }
}