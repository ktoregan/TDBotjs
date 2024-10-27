const path = require('path');
const { getConnection } = require(path.join(__dirname, '..', 'database', 'database'));

async function handlePickHistory(interaction) {
    const userId = interaction.user.id;

    try {
        const db = await getConnection();

        // Retrieve the user's pick history
        const [pickRows] = await db.execute(`
            SELECT week, player_name, is_successful
            FROM picks
            JOIN players ON picks.player_id = players.player_id
            WHERE picks.user_id = ?
            ORDER BY week ASC
        `, [userId]);

        if (pickRows.length === 0) {
            await interaction.reply({ content: "You haven't made any picks yet!", ephemeral: true });
            return;
        }

        // Format the pick history as a table
        let pickHistory = 'Wk  Player                    TD P\n';
        pickHistory += '------------------------------------\n';

        pickRows.forEach(pick => {
            const week = pick.week.toString().padEnd(2);                // Week padded to 2 characters
            const playerName = pick.player_name.padEnd(26);             // Player name padded to 26 characters
            const td = pick.is_successful ? '✅' : '❌';                 // Touchdown status
            const points = pick.is_successful ? '1' : '0';              // Points based on success

            // Add formatted row to pick history
            pickHistory += `${week} ${playerName} ${td} ${points}\n`;
        });

        // Send the pick history as a code block
        await interaction.reply({ content: `\`\`\`${pickHistory}\`\`\``, ephemeral: true });

    } catch (error) {
        console.error('Error handling pick history command:', error);
        await interaction.reply({ content: 'There was an error retrieving your pick history. Please try again later.', ephemeral: true });
    }
}

module.exports = { handlePickHistory };
