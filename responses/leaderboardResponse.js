const path = require('path');
const { getConnection } = require(path.join(__dirname, '..', 'database', 'database'));

async function handleLeaderboardResponse(interaction) {
    try {
        const db = await getConnection();

        const [rows] = await db.execute(
            'SELECT username, total_points FROM leaderboard ORDER BY total_points DESC LIMIT 10'
        );

        let leaderboard = 'Leaderboard:\n';
        leaderboard += '---------------------------------\n';

        rows.forEach(row => {
            leaderboard += `${row.username}: ${row.total_points} points\n`;
        });

        await interaction.reply({ content: `\`\`\`${leaderboard}\`\`\``, ephemeral: true });

        // No need to close the connection if using a pool
    } catch (error) {
        console.error('Error handling leaderboard command:', error);
        await interaction.reply({ content: 'There was an error fetching the leaderboard. Please try again later.', ephemeral: true });
    }
}

module.exports = { handleLeaderboardResponse };