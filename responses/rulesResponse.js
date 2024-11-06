async function handleRulesResponse(interaction) {
   const rulesMessage = `
   **TD Showdown Game Rules:**

   🪟 **Pick Window**:
   - The pick window opens every Thursday at 9 AM UK / 10 AM CET / 4 AM CT / 8 PM AEDT.
   - It closes 5 minutes before game start times & re-opens after the last game each day, except after Monday’s game when it stays closed until the next Thursday.

   🤞🏻 **Making Your Pick**:
   - Use **/pick** to select a player. Start typing to see an autocomplete list of active players across all positions.
   - One pick per week! You’re locked in once you confirm, so choose wisely.
   - If the window is closed, you’ll be notified that picking isn’t available.

   ⚠️ **Injury Notifications**:
   - The bot checks for player injuries 1 hour, 45 mins, 30 mins, & 15 mins before each game.
   - If your pick is marked as injured, you’ll receive a notification to re-pick, & your previous choice is removed.

   🏈 **Scoring**:
   - If your player scores a TD, you earn 1 point. A non-scorer earns no points.
   - The bot checks for scores every 5 minutes during games, notifying you if your player scores.
   - Once a player scores, no further TDs count so you won’t get duplicate alerts.

   🏆 **Leaderboard**:
   - The leaderboard is posted on Tuesdays at 9 AM UK / 10 AM CET / 4 AM CT / 8 PM AEDT.
   `;

   await interaction.reply({ content: rulesMessage, ephemeral: true });
}

module.exports = { handleRulesResponse };
