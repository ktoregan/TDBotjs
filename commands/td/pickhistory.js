const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pickhistory')
        .setDescription('View your TD Showdown pick history.'),

    async execute(interaction) {
        const { handlePickHistory } = require(path.join(__dirname, '..', '..', 'responses', 'pickhistoryResponse'));
        await handlePickHistory(interaction);
    }
};