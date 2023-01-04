// These scripts provide functionality for the buttons and other user-logic on the site.

// Plays the track that the user clicks on
function playSelectedTrack(e)
{
    // TODO: I don't belive I will need this function after all. Delete it if this is the case.
    
    // console.log('AT: playSelectedTrack()');
    
    // console.log(e);
}




// Adds the currently playing track to the list of chosen tracks.
function addToChosen()
{
    // TODO: The implementation of this function is a dummy implementation. It needs to be replaced. (it currently changes the color of the button text)
    let e = document.querySelector('#btn_chosen')
    
    if (e.style.color === 'red') {
        e.style.color = '#FFA366';
    } else {
        e.style.color = 'red';
    }
}