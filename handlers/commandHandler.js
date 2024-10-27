const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = (client) => {
    client.commands = new Collection();
    const commandFolders = fs.readdirSync(path.join(__dirname, '../commands'));

    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(path.join(__dirname, '../commands', folder)).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(__dirname, '../commands', folder, file));
            client.commands.set(command.data.name, command);
        }
    }
};