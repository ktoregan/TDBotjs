const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const { handlePickResponse } = require(path.join(__dirname, '..', '..', 'responses', 'pickResponse'));
const { getConnection } = require(path.join(__dirname, '..', '..', 'database', 'database'));
const { getCurrentWeek, getSeason } = require(path.join(__dirname, '..', '..', 'services', 'utils'));

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
        const db = await getConnection();
        const currentWeek = getCurrentWeek();
        const season = getSeason();

        // Check if the pick window is open
        const [windowStatus] = await db.execute(
            'SELECT is_open FROM pick_window WHERE week = ? AND season = ? LIMIT 1',
            [currentWeek, season]
        );

        // If the pick window is closed, send a message to the user
        if (!windowStatus.length || windowStatus[0].is_open === 0) {
            await interaction.reply({ content: "You cannot pick a player while games are in play.", ephemeral: true });
            return;
        }

        // If the window is open, proceed with handling the pick
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