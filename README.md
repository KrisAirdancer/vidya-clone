# vidya-clone
A clone of the [Vidya Intarweb Playlist](https://www.vipvgm.net/) by Cats777.

# Development Stages

## Next

- The frontend and backend are working (vidya-backend & vidya-frontend). However, they aren't communicating yet. **The next step is to connect them:**
    - What I need is for the data from the backend to be passed to the frontend. That is, the backend won't be defining any of the frontend HTML, JS, or CSS. Instead, the backend will pass data to the frontend, and the frontend will style that data into a nice webpage.
    - In this case, I need the backend to pass audio files (.mp3) and playlist files (.xml) to the frontend where they can be used by the JS logic to generate the list of songs from the playlist and, ultimately, play the songs.
        - It might be easier to just keep all of the audio and playlist files in the `public` directory, then just access them like I did with v1 of this project.
        - Another way would be to have the backend send the frontend a list of songs and hte playlist files on startup, then have the frontend request the audio file from the backend when a certain song is played.
    - **To start,** just pass text back and forth.

## Tasks/Work

- [ ] Build a basic website with a .NET backend (Minimal API) and React.js frontend
    - Tutorial from Microsoft on how to do this [here](https://learn.microsoft.com/en-us/training/paths/aspnet-core-minimal-api/)
    - React.js tutorials:
        - [Getting Started with React.js](https://reactjs.org/docs/getting-started.html)
        - [React.js Tutorial](https://reactjs.org/docs/getting-started.html)
        - [React.js Building Blocks](https://reactjs.org/docs/hello-world.html)
- [ ] Build the Vidya clone
    - [ ] Include the draggable controls element
        - A React.js tutorial on this is [here](https://www.youtube.com/watch?v=jfJ5ON05JKk)
- [ ] Replace the basic website frontend with the Viday clone
- [ ] Once the player is fully functional,
    - Convert this project into the new AirdancerServer & AirdancerPlayer.
    - Make a personal website out of it.
    - Put together a nice looking homepage with links to LinkedIn, GitHub, and the VidyaPlayer clone as well as some information about me.
    - Try to run the project on AirdancerPi (RPi).
        - Maybe use Docker?
    - Whether I'm able to get it running on RPi or not, try to deploy the project to AWS or Azure.
        - AWS might be better b/c it is more widely used.


# Other Information

## Used Libraries

*This project uses the following libraries:
- `styled-components`