async function handleHelpResponse(interaction) {
    const helpMessage = `
    **TD Showdown Command List:**
    
    **/join** - Join the TD Showdown game. Confirm your entry by typing "y" to participate.

    **/pick** - Choose a player for the current week's game.

    **/pickhistory** - View your pick history and score.

    **/notifications** - Manage your notification preferences. Choose which alerts you want to receive.

    **/rules** - View the game rules and scoring guidelines.
    `;

    await interaction.reply({ content: helpMessage, ephemeral: true });
}

module.exports = { handleHelpResponse };
