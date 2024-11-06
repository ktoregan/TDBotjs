const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
const { getConnection } = require(path.join(__dirname, '..', 'database', 'database'));

const notificationLabels = {
    'pick_open': 'Pick window opens',
    'leaderboard_update': 'Leaderboard is posted',
    'player_injury': 'My player becomes inactive',
    'player_touchdown': 'My player scores',
    'no_pick_reminder': 'Reminder to pick before Sunday games '  // Add no-pick notification
};

async function showNotificationSettings(interaction) {
    if (interaction.replied || interaction.deferred) return;

    try {
        const db = await getConnection();
        const userId = interaction.user.id;

        // Fetch user's current notification settings
        const [rows] = await db.execute(
            'SELECT notification_type, is_enabled FROM user_notifications WHERE discord_id = ?',
            [userId]
        );

        if (rows.length === 0) {
            await interaction.reply({
                content: 'You are not in the game or have no notification preferences set up.',
                ephemeral: true
            });
            return;
        }

        // Build buttons for each notification type
        const buttons = rows.map(row => {
            const label = notificationLabels[row.notification_type] || row.notification_type;
            return new ButtonBuilder()
                .setCustomId(`toggle_${row.notification_type}`)
                .setLabel(`${label} (${row.is_enabled ? 'Yes' : 'No'})`)
                .setStyle(row.is_enabled ? ButtonStyle.Success : ButtonStyle.Danger);
        });

        // Create action rows for buttons
        const actionRows = [];
        for (let i = 0; i < buttons.length; i += 5) {
            actionRows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
        }

        // Add the "Save Changes" button as the last row
        const saveChangesButton = new ButtonBuilder()
            .setCustomId('save_changes')
            .setLabel('Save Changes')
            .setStyle(ButtonStyle.Primary);
        actionRows.push(new ActionRowBuilder().addComponents(saveChangesButton));

        await interaction.reply({
            content: 'Manage your notification preferences:',
            components: actionRows,
            ephemeral: true
        });
    } catch (error) {
        console.error('Error fetching notification settings:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: 'An error occurred while fetching your notification settings.',
                ephemeral: true
            });
        }
    }
}

// Handle individual notification toggle button interactions
async function handleNotificationToggle(interaction) {
    const db = await getConnection();
    const userId = interaction.user.id;
    const notificationType = interaction.customId.replace('toggle_', '');

    try {
        // Check if "Save Changes" was clicked
        if (interaction.customId === 'save_changes') {
            // Confirm changes saved and dismiss the buttons by editing the original message
            await interaction.update({
                content: 'Your notification preferences have been saved!',
                components: []  // Clears the buttons
            });
            return;  // Exit early as no further processing is needed
        }

        // Fetch all notification settings for toggling
        const [rows] = await db.execute(
            'SELECT notification_type, is_enabled FROM user_notifications WHERE discord_id = ?',
            [userId]
        );

        if (rows.length === 0) {
            await interaction.reply({
                content: 'Notification settings not found. Please try again.',
                ephemeral: true
            });
            return;
        }

        // Toggle the state of the clicked button
        const updatedRows = rows.map(row => {
            if (row.notification_type === notificationType) {
                row.is_enabled = !row.is_enabled;  // Toggle the current status
                // Update the database with the new status for this button
                db.execute(
                    'UPDATE user_notifications SET is_enabled = ? WHERE discord_id = ? AND notification_type = ?',
                    [row.is_enabled, userId, notificationType]
                );
            }
            return row;
        });

        // Build updated buttons with labels and styles
        const buttons = updatedRows.map(row => {
            const label = notificationLabels[row.notification_type] || row.notification_type;
            return new ButtonBuilder()
                .setCustomId(`toggle_${row.notification_type}`)
                .setLabel(`${label} (${row.is_enabled ? 'Yes' : 'No'})`)
                .setStyle(row.is_enabled ? ButtonStyle.Success : ButtonStyle.Danger);
        });

        // Create action rows for the updated buttons
        const actionRows = [];
        for (let i = 0; i < buttons.length; i += 5) {
            actionRows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
        }

        // Add the "Save Changes" button as the last row
        const saveChangesButton = new ButtonBuilder()
            .setCustomId('save_changes')
            .setLabel('Save Changes')
            .setStyle(ButtonStyle.Primary);
        actionRows.push(new ActionRowBuilder().addComponents(saveChangesButton));

        // Update the interaction with all buttons, including the toggled one
        await interaction.update({
            content: 'Manage your notification preferences:',
            components: actionRows,
        });
    } catch (error) {
        console.error('Error toggling notification:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: 'An error occurred while updating your notification settings.',
                ephemeral: true
            });
        }
    }
}

module.exports = {
    showNotificationSettings,
    handleNotificationToggle
};