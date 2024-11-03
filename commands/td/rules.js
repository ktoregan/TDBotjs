const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const { handleRulesResponse } = require(path.join(__dirname, '..', '..', 'responses', 'rulesResponse'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('Displays the rules of the TD Showdown game.'),

    async execute(interaction) {
        await handleRulesResponse(interaction);
    }
};