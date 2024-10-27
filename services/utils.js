// Helper function to get the current week based on dates
function getCurrentWeek() {
    const today = new Date();
    const weekMapping = {
        7: new Date(2024, 9, 17),   // October is month 9 in JavaScript Date
        8: new Date(2024, 9, 24),
        9: new Date(2024, 9, 31),
        10: new Date(2024, 10, 7),
        11: new Date(2024, 10, 14),
        12: new Date(2024, 10, 21),
        13: new Date(2024, 10, 28),
        14: new Date(2024, 11, 5),
        15: new Date(2024, 11, 12),
        16: new Date(2024, 11, 19),
        17: new Date(2024, 11, 26),
        18: new Date(2025, 0, 2)    // January is month 0
    };

    let currentWeek = null;

    for (const week in weekMapping) {
        if (today < weekMapping[week]) {
            break;
        }
        currentWeek = parseInt(week);
    }

    return currentWeek;
}

// Helper function to get the current season
function getSeason() {
    return 2024; // You can adjust this to dynamically calculate the season
}

module.exports = { getCurrentWeek, getSeason };