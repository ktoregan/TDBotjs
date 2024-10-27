require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

// Initialize the client with intents
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ]
});

// Load commands and events
const loadCommands = require('./handlers/commandHandler');
const loadEvents = require('./handlers/eventHandler');

// Ensure client.commands is set up for command loading
client.commands = new Map();
loadCommands(client);
loadEvents(client);

// Login and ready event
client.login(process.env.DISCORD_BOT_TOKEN);
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Loaded commands: ${[...client.commands.keys()].join(', ')}`);
});

// Log incoming interactions (for testing purposes)
client.on('interactionCreate', (interaction) => {
    console.log(`Received interaction: ${interaction.commandName}`);
});