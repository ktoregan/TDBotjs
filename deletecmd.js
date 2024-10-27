const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

// Replace GUILD_ID with your actual guild ID and COMMAND_ID with the actual command ID you want to delete
const guildId = process.env.GUILD_ID;
const commandId = '1300085090931445856';  // Add your specific command ID here

(async () => {
    try {
        console.log(`Deleting command ${commandId}...`);

        await rest.delete(
            Routes.applicationGuildCommand(process.env.CLIENT_ID, guildId, commandId),
        );

        console.log(`Command ${commandId} deleted successfully!`);
    } catch (error) {
        console.error(error);
    }
})();
