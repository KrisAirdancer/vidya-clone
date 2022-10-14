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

- [x] Build a basic website with a .NET backend (Minimal API) and React.js frontend
    - Tutorial from Microsoft on how to do this [here](https://learn.microsoft.com/en-us/training/paths/aspnet-core-minimal-api/)
    - React.js tutorials:
        - [Getting Started with React.js](https://reactjs.org/docs/getting-started.html)
        - [React.js Tutorial](https://reactjs.org/docs/getting-started.html)
        - [React.js Building Blocks](https://reactjs.org/docs/hello-world.html)
- [ ] Build the frontend
    - [x] Learn how to add CSS styling to React.js apps and components
    - [ ] Build the Nav Bar
        - Use [This](https://www.youtube.com/watch?v=fYq5PXgSsbE) to add flexbox to the navbar and position the buttons and other elements in it properly.
        - [This](https://www.youtube.com/watch?v=SLfhMt5OUPI) looks like a good tutorial.
    - [ ] Build the files list
        - Use dummy data to start.
            - Use json-server? Or just put all of the audio files and hte playlist XML into the public folder?
    - [ ] Build the draggable controls element
        - A React.js tutorial on this is [here](https://www.youtube.com/watch?v=jfJ5ON05JKk)
- [ ] Build the backend
    - Serve audio files to the frontend
    - Serve playlist files to the frontend
- [ ] Once the player is fully functional,
    - Convert this project into the new AirdancerServer & AirdancerPlayer.
    - Make a personal website out of it.
    - Put together a nice looking homepage with links to LinkedIn, GitHub, and the VidyaPlayer clone as well as some information about me.
    - Try to run the project on AirdancerPi (RPi).
        - Maybe use Docker?
    - Whether I'm able to get it running on RPi or not, try to deploy the project to AWS or Azure.
        - AWS might be better b/c it is more widely used.


# Other Information

## Colors

- Blue: #1F4B7F
- Yellow: #FFA366

## Sources

- Favicon from [Icons8](https://icons8.com/)

## SOP

- To run this project:
    - Start backend: `cd vidya-backend` and then run `dotnet run`
    - Start frontend: `cd vidya-frontend` and then run `npm start`

# Resources

## Used

- [How To Create A Navbar In React With Routing](https://www.youtube.com/watch?v=SLfhMt5OUPI)
    - Used to setup the nav bar.
- [Learn React In 30 Minutes](https://www.youtube.com/watch?v=hQAHSlTtcmY&t=1078s)
    - Used to get an overview of React.js and to setup the basic React.js part of the project.

## Unused

- [CSS Positioning Tutorial, The Net Ninja](https://www.youtube.com/watch?v=k4taTzkhzHc)
    - This might be helpful for getting the navbar to sit on top of other elements.
- [The Net Ninja, Full React Tutorial](https://www.youtube.com/watch?v=j942wKiXFu8&list=PL4cUxeGkcC9gZD-Tvwfod2gaISzfRiP9d)