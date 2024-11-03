// webhookServer.js
const express = require('express');
const { Client, Intents, MessageEmbed } = require('discord.js');
require('dotenv').config();

const app = express();
const port = 3000;

// Discord client setup
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

// Express middleware to parse JSON payloads
app.use(express.json());

// Middleware for Authorization
app.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (token !== process.env.WEBHOOK_SECRET) {
        return res.status(403).send('Forbidden');
    }
    next();
});

// Webhook to Open Pick Window
app.post('/webhook/open-pick-window', async (req, res) => {
    try {
        const { weekNumber, taggedUsers } = req.body;
        const mentions = taggedUsers.map(userId => `<@${userId}>`).join(' ');

        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        await channel.send(`${mentions} The pick window is now open for Week ${weekNumber}! 🏈`);
        
        res.status(200).send('Pick window opened and message sent.');
    } catch (error) {
        console.error("Error opening pick window:", error);
        res.status(500).send('Failed to send message.');
    }
});

// Webhook to Notify Player Injury
app.post('/webhook/player-injury', async (req, res) => {
    try {
        const { playerName, injuryStatus, taggedUsers } = req.body;
        const mentions = taggedUsers.map(userId => `<@${userId}>`).join(' ');

        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        await channel.send(`${mentions} ‼️ WARNING‼️ Your pick, ${playerName}, has been listed as ${injuryStatus} & is now void. Please select a new player for this week.`);
        
        res.status(200).send('Player injury notification sent.');
    } catch (error) {
        console.error("Error sending player injury notification:", error);
        res.status(500).send('Failed to send message.');
    }
});

// Webhook to Notify Player Touchdown
app.post('/webhook/player-touchdown', async (req, res) => {
    try {
        const { playerName, taggedUsers } = req.body;
        const mentions = taggedUsers.map(userId => `<@${userId}>`).join(' ');

        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        await channel.send(`${mentions} Congrats! 🥳 Your pick ${playerName} has scored a Touchdown, earning you 1 point! 🏆`);
        
        res.status(200).send('Touchdown notification sent.');
    } catch (error) {
        console.error("Error sending touchdown notification:", error);
        res.status(500).send('Failed to send message.');
    }
});

// Webhook to Post Leaderboard
app.post('/webhook/post-leaderboard', async (req, res) => {
    try {
        const { leaderboard, overall } = req.body;

        const embed = new MessageEmbed()
            .setTitle("Weekly Results")
            .setDescription("```" + leaderboard + "```")
            .addField("Overall Leaderboard", "```" + overall + "```")
            .setColor('#FFA500'); // Optional: Set color for the embed

        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        await channel.send({ embeds: [embed] });

        res.status(200).send('Leaderboard posted.');
    } catch (error) {
        console.error("Error posting leaderboard:", error);
        res.status(500).send('Failed to post leaderboard.');
    }
});

// Start the Express server after the bot is ready
client.once('ready', () => {
    console.log('Discord bot is ready!');
    app.listen(port, () => {
        console.log(`Webhook server running on port ${port}`);
    });
});

// Log in to Discord
client.login(process.env.DISCORD_BOT_TOKEN);