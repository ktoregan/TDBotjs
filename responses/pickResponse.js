const path = require('path');
const { getConnection } = require(path.join(__dirname, '..', 'database', 'database'));
const { getCurrentWeek, getSeason } = require(path.join(__dirname, '..', 'services', 'utils'));

async function handlePickResponse(interaction) {
    const player = interaction.options.getString('player');
    const userId = interaction.user.id;

    try {
        const db = await getConnection();

        // Check player details with injury status filtering
        const [playerRows] = await db.execute(
            `SELECT * FROM players 
             WHERE player_name = ? 
               AND is_free_agent = 0 
               AND (injury_status IS NULL 
                    OR injury_status NOT IN ('Injured Reserve', 'Doubtful', 'Out', 'Questionable', 'Reserve-Ret'))`,
            [player]
        );

        if (playerRows.length === 0) {
            await interaction.reply({ content: 'Player not found or unavailable. Please try another player.', ephemeral: true });
            return;
        }

        const playerId = playerRows[0].player_id;
        const currentWeek = getCurrentWeek();

        // Check if the user already has a pick for this week
        const [existingPickRows] = await db.execute('SELECT * FROM picks WHERE user_id = ? AND week = ?', [userId, currentWeek]);
        if (existingPickRows.length > 0) {
            await interaction.reply({ content: 'You already have a pick for this week. Please try again next week.', ephemeral: true });
            return;
        }

        // Check if a game is scheduled for the player's team this week
        const [gameRows] = await db.execute(
            'SELECT game_id FROM games WHERE week = ? AND (home_team = ? OR away_team = ?) LIMIT 1',
            [currentWeek, playerRows[0].team_name, playerRows[0].team_name]
        );

        if (gameRows.length === 0) {
            await interaction.reply({ content: `No game scheduled for ${player}'s team this week. Please choose another player.`, ephemeral: true });
            return;
        }

        const gameId = gameRows[0].game_id;

        // Insert the pick into the database
        await db.execute(
            'INSERT INTO picks (game_id, player_id, user_id, week, pick_time, last_updated, season) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)',
            [gameId, playerId, userId, currentWeek, getSeason()]
        );

        await interaction.reply({ content: `You successfully picked ${player} for week ${currentWeek}!`, ephemeral: true });

        // Send a new message to the channel instead of replying
        await interaction.channel.send({ content: `<@${interaction.user.id}> has locked in their pick for week ${currentWeek}! 🙏🏻` });        

    } catch (error) {
        console.error('Error handling pick command:', error);
        await interaction.reply({ content: 'There was an error making your pick. Please try again later.', ephemeral: true });
    }
}

module.exports = { handlePickResponse };