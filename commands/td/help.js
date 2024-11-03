const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const { handleHelpResponse } = require(path.join(__dirname, '..', '..', 'responses', 'helpResponse'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of commands and their descriptions.'),

    async execute(interaction) {
        await handleHelpResponse(interaction);
    }
};