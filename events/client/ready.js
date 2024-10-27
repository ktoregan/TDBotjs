module.exports = {
    name: 'ready',
    once: true, // Runs only once
    execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
    },
};