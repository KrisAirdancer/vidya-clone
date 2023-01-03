// Generate tracksHTML from playlist file

// TODO: Need to change the playlist file that is used based on the user's selection (per the playlist dropdown)
    // Can likely just grab the currenly selected playlist from the <select> tag using a QuerySelector

let reader = new FileReader();

fetch('playlists/vip-playlist.json')
    .then(response => response.json())
    .then(tracksData => {
        console.log(tracksData);
    });









// Inject tracks HTML into DOM

let tracksList = document.getElementById('tracks-list');

tracksList.innerHTML = '<li class="track-info">Hello, World!</li>';