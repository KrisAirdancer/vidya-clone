const fs = require('fs');
const fsPromises = require('fs/promises');

// Directories being accessed
const TRACKS_DIR = '../vidya-frontend/public/tracks/';
const TRACKS_MASTER_LIST_DIR = '../vidya-backend/data/tracks-master-list.json';

/**
 * Generates a JSON representation of all of the tracks located at tracksDir and stores
 * that representation in a JSON file at targetDir.
 * 
 * Overrites the contents of the file specified at targetDir.
 */
async function generateTracksJSON(tracksDir, targetDir) {

    let metadata = [];

    let files = fs.readdirSync(tracksDir);

    files.forEach(file => {

        // Tokenize track names
        let tokens = file.split(' - ');

        let track = {
            trackID: tokens[0],
            trackGame: tokens[1],
            trackName: tokens[2]
        };
        
        metadata.push(track);
    });

    await fsPromises.writeFile(targetDir, JSON.stringify(metadata));
}

/**
 * Reads the entire contents of the tracks-master-list.js file and prints them to the console.
 * 
 * This method for testing purposes.
 */
async function printTracksMasterList(sourceDir, encoding) {

    let metadata = fs.readFileSync(sourceDir, encoding, (error) => {
        if (error) {
            console.log(error);
        }
    });
    console.log(metadata);
}

/**************
 * OPERATIONS *
 **************/

generateTracksJSON(TRACKS_DIR, TRACKS_MASTER_LIST_DIR);
// printTracksMasterList(TRACKS_MASTER_LIST_DIR, 'utf-8');


