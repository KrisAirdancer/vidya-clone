const fs = require('fs');



const TARGET_DIR = '../vidya-frontend/public/tracks/';

function generateTracksJSON() {

    let files = fs.readdirSync(TARGET_DIR);

    files.forEach(file => {
        console.log(file);

        // Tokenize track names
        console.log(file.split(' - '));
    });
}


generateTracksJSON();










// Loop over vidya-frontend/public/tracks/
    // Extract Track ID, Game Name, and Track Name from all filenames
    // Alphabetize list by Game Name then Track Name
    // Store list in .json file in /utilities/outputs/
