const path = require('path');
const { getConnection } = require(path.join(__dirname, '..', 'database', 'database'));
const { getCurrentWeek } = require(path.join(__dirname, '..', 'services', 'utils'));

async function handleJoinResponse(interaction) {
    const confirmation = interaction.options.getString('confirmation');

    if (confirmation.toLowerCase() !== 'y') {
        await interaction.reply({ content: 'You need to confirm with "y" to join the game.', ephemeral: true });
        return;
    }

    const userId = interaction.user.id;
    const username = interaction.user.username;

    // Define the notification types
    const notificationTypes = ['pick_open', 'player_injury', 'player_touchdown', 'leaderboard_update', 'no_pick_reminder'];

    try {
        const db = await getConnection();

        const [rows] = await db.execute('SELECT * FROM users WHERE discord_id = ?', [userId]);

        if (rows.length > 0) {
            await interaction.reply({ content: `${username}, you are already in the game!`, ephemeral: true });
        } else {
            // Insert the new user into the users table
            await db.execute(
                'INSERT INTO users (discord_id, username, opt_in, joined_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
                [userId, username, true]
            );

            // Insert the initial leaderboard entry
            await db.execute(
                'INSERT INTO leaderboard (user_id, points_week, total_points, week, last_updated) VALUES (?, 0, 0, ?, CURRENT_TIMESTAMP)',
                [userId, getCurrentWeek()]
            );

            // Insert default notification preferences
            for (const notificationType of notificationTypes) {
                await db.execute(
                    'INSERT INTO user_notifications (discord_id, notification_type, is_enabled, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
                    [userId, notificationType, true]
                );
            }

            await interaction.reply({ content: `<@${userId}> has successfully joined TD Showdown! 🥳`, ephemeral: false });
        }

        // No need for db.end() if using a connection pool
    } catch (error) {
        console.error('Error handling /td join command: ', error);
        await interaction.reply({ content: 'There was an error joining the game. Please try again later.', ephemeral: true });
    }
}

module.exports = { handleJoinResponse };
