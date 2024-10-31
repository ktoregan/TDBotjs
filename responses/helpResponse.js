async function handleHelpResponse(interaction) {
    const helpMessage = `
    **TD Bot Command List:**
    
    **/join** - Join the TD Showdown game. Confirm your entry by typing "y" to participate.

    **/pick** - Select a player for the current week's game. Choose an active player that is not injured. You can only make one pick per week, and the pick must be made when no games are in play. 

    **/pickhistory** - View your pick history, including which players you picked each week and if they scored a touchdown.

    Type the commands directly as shown. If your selected player is injured, the bot will notify you & allow you to pick again.
    `;

    await interaction.reply({ content: helpMessage, ephemeral: true });
}

module.exports = { handleHelpResponse };
