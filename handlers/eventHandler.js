const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '..', 'events');
    const eventFolders = fs.readdirSync(eventsPath);

    for (const folder of eventFolders) {
        const folderPath = path.join(eventsPath, folder);

        // Check if folderPath is a directory
        if (fs.statSync(folderPath).isDirectory()) {
            const eventFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

            for (const file of eventFiles) {
                const event = require(path.join(folderPath, file));
                
                // Add this console.log here
                console.log(`Loading event: ${event.name}`);

                // Attach events as once or on based on event's properties
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }
            }
        }
    }
};