// Generate tracksHTML from playlist file

// TODO: Need to change the playlist file that is used based on the user's selection (per the playlist dropdown)
    // Can likely just grab the currenly selected playlist from the <select> tag using a QuerySelector

// Generate tracksHTML

let tracksHTML = [];

let reader = new FileReader();

fetch('playlists/vip-playlist.json')
    .then(response => response.json())
    .then(tracksData => {
        // console.log(tracksData);

        tracksData.forEach(track => {
            // console.log(track);

            tracksHTML.push(
                `<li class="track-info">${track.trackGame} - ${track.trackName}</li>`
            );
        });

        console.log(tracksHTML.join(''));
        
        // Inject tracks HTML into DOM
        
        let tracksList = document.querySelector('#tracks-list');
        console.log('here');
        tracksList.innerHTML = tracksHTML.join('');
    });
