const { SlashCommandBuilder } = require('discord.js');
const path = require('path');  // Add this line
const { handleJoinResponse } = require(path.join(__dirname, '..', '..', 'responses', 'joinResponse'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join the TD Showdown game')
        .addStringOption(option =>
            option.setName('confirmation')
                .setDescription('Type "y" to confirm joining.')
                .setRequired(true)),

    async execute(interaction) {
        await handleJoinResponse(interaction);
    },
};