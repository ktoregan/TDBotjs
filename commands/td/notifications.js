const path = require('path');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('notifications')
        .setDescription('View and manage your notification preferences'),
    async execute(interaction) {
        // Call the response handler in notificationResponse.js to handle this interaction
        const notificationResponse = require(path.join(__dirname, '..', '..', 'responses', 'notificationResponse'));
        await notificationResponse.showNotificationSettings(interaction);
    },
};