async function handleRulesResponse(interaction) {
   const rulesMessage = `
   **TD Showdown Game Rules:**

   🪟 **Pick Window**:
   - The pick window opens every Thursday at 9 AM UK / 10 AM CET / 4 AM CT / 8 PM AEDT.
   - It closes 5 minutes before game start times & re-opens after the last game each day, except after Monday’s game when it stays closed until the next Thursday.

   🤞🏻 **Making Your Pick**:
   - Use **/pick** to select an active, uninjured player who is not a free agent. The autocomplete helps with eligible players.
   - One pick per week! You’re locked in once you confirm, so choose wisely.
   - If the window is closed, you’ll be notified that picking isn’t available.

   ⚠️ **Injury Notifications**:
   - The bot checks for player injuries 1 hour, 45 mins, 30 mins, & 15 mins before each game.
   - If your pick is marked as injured, you’ll receive a notification to re-pick, & your previous choice is removed.

   🏈 **Scoring**:
   - Each touchdown scored by your player earns you 1 point.
   - The bot checks for scores every 6 minutes during games, notifying you when your player scores.
   - Once a player scores, they’re marked as “successful,” so you won’t get duplicate alerts.

   🏆 **Leaderboard**:
   - The weekly leaderboard is posted on Tuesdays at 9 AM, displaying top scorers for the week & season.
   - **/pickhistory** shows your past picks & results.
   `;

   await interaction.reply({ content: rulesMessage, ephemeral: true });
}

module.exports = { handleRulesResponse };
