const schedule = require('node-schedule');
const { exec } = require('child_process');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config(); // Load environment variables

const mysql = require('mysql2/promise');
const { getCurrentWeek } = require('C:/TDBot/helpers/utils');
const irishTimezone = 'Europe/Dublin';

// Create the Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Function to run Python scripts
function runPythonScript(scriptName, callback) {
    exec(`python C:/TDBot/python/${scriptName}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error running ${scriptName}: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error output from ${scriptName}: ${stderr}`);
            return;
        }
        console.log(`Output from ${scriptName}: ${stdout}`);
        if (callback) callback();
    });
}

// Function to open the pick window and notify users who haven't picked yet
async function openPickWindow() {
    try {
        const db = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB,
            port: process.env.MYSQL_PORT,
            ssl_ca: process.env.SSL_CERT_PATH
        });

        const currentWeek = getCurrentWeek();

        // Fetch users who haven't picked yet for the current week
        const [users] = await db.execute(`
            SELECT u.discord_id FROM users u
            LEFT JOIN picks p ON u.user_id = p.user_id AND p.week = ?
            WHERE p.user_id IS NULL AND u.opt_in = 1
        `, [currentWeek]);

        if (users.length > 0) {
            const userTags = users.map(user => `<@${user.discord_id}>`).join(', ');
            const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);

            // Send notification tagging only users who haven't picked yet
            await channel.send(`${userTags} The pick window is now open for Week ${currentWeek}! 🏈`);
        } else {
            console.log("All users have made their picks for this week.");
        }

        await db.end();
    } catch (error) {
        console.error('Error opening pick window:', error);
    }
}

// Function to close the pick window 5 minutes before the first game starts
async function closePickWindowBeforeFirstGame() {
    try {
        const db = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB,
            port: process.env.MYSQL_PORT,
            ssl_ca: process.env.SSL_CERT_PATH
        });

        const [games] = await db.execute('SELECT MIN(game_time) as first_game_time FROM games WHERE week = ?', [getCurrentWeek()]);
        const firstGameTime = games[0].first_game_time;
        
        if (firstGameTime) {
            const gameDateTime = new Date(firstGameTime);
            const closeTime = new Date(gameDateTime.getTime() - 5 * 60 * 1000); // Subtract 5 minutes

            // Just scheduling pick window close without notification
            schedule.scheduleJob(closeTime, async () => {
                console.log('Pick window is now closed.');
            });
        }

        await db.end();
    } catch (error) {
        console.error('Error closing pick window: ', error);
    }
}

// Function to reopen the pick window 5 minutes after the final game of the day
async function reopenPickWindowAfterFinalGame() {
    try {
        const db = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB,
            port: process.env.MYSQL_PORT,
            ssl_ca: process.env.SSL_CERT_PATH
        });

        const [games] = await db.execute('SELECT MAX(game_time) as last_game_time FROM games WHERE week = ?', [getCurrentWeek()]);
        const lastGameTime = games[0].last_game_time;
        
        if (lastGameTime) {
            const gameDateTime = new Date(lastGameTime);
            const reopenTime = new Date(gameDateTime.getTime() + 5 * 60 * 1000); // Add 5 minutes

            schedule.scheduleJob(reopenTime, async () => {
                console.log('Pick window has reopened.');
            });
        }

        await db.end();
    } catch (error) {
        console.error('Error reopening pick window: ', error);
    }
}

// Open pick window every Thursday at 9 AM Irish time
schedule.scheduleJob({ hour: 9, minute: 0, tz: irishTimezone, dayOfWeek: 4 }, () => {
    runPythonScript('getPlayerInfo.py', () => {
        runPythonScript('fetchschedule.py', () => {
            openPickWindow();  // Open pick window and notify users
            closePickWindowBeforeFirstGame();  // Schedule the window to close

            // **Schedule injury checks for the games after fetching the schedule**
            scheduleInjuryChecks();  // <-- This is where it's invoked now
        });
    });
});

// After the first game, check if we can reopen the window for the rest of the week, excluding after the last game
[4, 5, 6, 0].forEach(dayOfWeek => { // Thursday to Sunday
    schedule.scheduleJob({ hour: 23, minute: 59, tz: irishTimezone, dayOfWeek }, () => {
        reopenPickWindowAfterFinalGame();
    });
});

// Schedule player injury checks 1 hour, 45 mins, 30 mins, and 15 mins before each game
async function scheduleInjuryChecks() {
    try {
        const db = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB,
            port: process.env.MYSQL_PORT,
            ssl_ca: process.env.SSL_CERT_PATH
        });

        const [games] = await db.execute('SELECT game_time FROM games WHERE week = ?', [getCurrentWeek()]);

        for (const game of games) {
            const gameDateTime = new Date(game.game_time);

            [1, 0.75, 0.5, 0.25].forEach(hoursBefore => {
                const checkTime = new Date(gameDateTime.getTime() - hoursBefore * 60 * 60 * 1000); // Subtract hours
                schedule.scheduleJob(checkTime, () => runPythonScript('getPlayerInfo.py'));
            });
        }

        await db.end();
    } catch (error) {
        console.error('Error scheduling injury checks: ', error);
    }
}

// Run leaderboard updates on Tuesday at 9 AM Irish time
schedule.scheduleJob({ hour: 9, minute: 0, tz: irishTimezone, dayOfWeek: 2 }, () => {
    runPythonScript('leaderboard.py');
});

// Run getPlayerInfo.py and fetchschedule.py scripts daily at 9 AM on Thursday, Friday, Saturday, Sunday, and Monday
[4, 5, 6, 0, 1].forEach(dayOfWeek => {
    schedule.scheduleJob({ hour: 9, minute: 0, tz: irishTimezone, dayOfWeek }, () => {
        runPythonScript('getPlayerInfo.py', () => runPythonScript('fetchschedule.py'));
    });
});

module.exports = {};