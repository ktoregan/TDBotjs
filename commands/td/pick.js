const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const { handlePickResponse } = require(path.join(__dirname, '..', '..', 'responses', 'pickResponse'));
const { getConnection } = require(path.join(__dirname, '..', '..', 'database', 'database'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pick')
        .setDescription('Pick a player for TD Showdown')
        .addStringOption(option =>
            option.setName('player')
                .setDescription('Enter the player name')
                .setRequired(true)
                .setAutocomplete(true)),

    async execute(interaction) {
        await handlePickResponse(interaction);
    },

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();

        try {
            console.log(`Autocomplete triggered with focused value: ${focusedValue}`);
            const db = await getConnection();
            const [playerRows] = await db.execute(
                `SELECT player_name FROM players 
                 WHERE is_free_agent = 0 
                   AND (injury_status IS NULL 
                        OR injury_status NOT IN ('Injured Reserve', 'Doubtful', 'Out', 'Questionable', 'Reserve-Ret')) 
                   AND player_name LIKE ? 
                 LIMIT 25`,
                [`%${focusedValue}%`]
            );

            const choices = playerRows.map(row => ({ name: row.player_name, value: row.player_name }));
            console.log(`Autocomplete choices:`, choices);

            await interaction.respond(choices);
        } catch (error) {
            console.error('Error handling autocomplete for pick command:', error);
            await interaction.respond([]);
        }
    }
};
