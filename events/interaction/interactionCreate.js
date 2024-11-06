const path = require('path');
const notificationResponse = require(path.join(__dirname, '..', '..', 'responses', 'notificationResponse'));

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
                }
            }
        } else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command || !command.autocomplete) return;

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error('Error handling autocomplete:', error);
                await interaction.respond([]);
            }
        } else if (interaction.isButton()) {
            const customId = interaction.customId;

            if (customId.startsWith('toggle_')) {
                try {
                    await notificationResponse.handleNotificationToggle(interaction);
                } catch (error) {
                    console.error('Error handling notification toggle:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Error processing your request. Please try again.', ephemeral: true });
                    }
                }
            } else if (customId === 'save_changes') {
                try {
                    await interaction.reply({ content: 'Your changes have been saved!', ephemeral: true });
                } catch (error) {
                    console.error('Error handling save changes:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Error saving your changes. Please try again.', ephemeral: true });
                    }
                }
            }
        }
    },
};