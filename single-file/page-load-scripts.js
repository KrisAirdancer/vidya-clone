// Generate tracksHTML from playlist file

// TODO: Need to change the playlist file that is used based on the user's selection (per the playlist dropdown)
    // Can likely just grab the currenly selected playlist from the <select> tag using a QuerySelector

// Generate tracksHTML

let tracksHTML = [];

let reader = new FileReader();

fetch('playlists/all-tracks.json')
    .then(response => response.json())
    .then(tracksData => {

        let sortedTracks = tracksData.sort((a, b) => {

            if (`${a.trackGame} - ${a.trackName}` < `${b.trackGame} - ${b.trackName}`) {
              return -1;
            } else if (a.gameName > b.gameName) {
              return 1;
            } else { // a === b
              return 0;
            }
          })

        sortedTracks.forEach(track => {

            tracksHTML.push(
                `<li class="track-info">${track.trackGame} — ${track.trackName}</li>`
            );
        });
        
        // Inject tracks HTML into DOM
        
        let tracksList = document.querySelector('#tracks-list');

        tracksList.innerHTML = tracksHTML.join('');
    });
