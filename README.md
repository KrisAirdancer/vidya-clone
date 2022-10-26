# vidya-clone
A clone of the [Vidya Intarweb Playlist](https://www.vipvgm.net/) by Cats777.

# Current Progress

<img src="documentation-images\progress-snapshot-oct-20-2022.png" width="75%">

# TODOs

- [ ] Rebuild the list of tracks
    - Generate the HTML for this with JavaScript.
    - See [this](https://www.youtube.com/watch?v=C4qzCbtlHvU) and [this](https://www.youtube.com/watch?v=XMjs2jQ9SXU).
- [ ] Build the draggable controls element
    - A React.js tutorial on this is [here](https://www.youtube.com/watch?v=jfJ5ON05JKk)
- [ ] Build the popup menu in the bottom right of the screen in the original.
    - Displays credits, logic to import/export chosen/exiled tracks (configurations), a link to the changelog, etc.
- [ ] Add symbols to control box and nav bar buttons (replace the placeholder text with symbols)


# Other Information

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


# Work Log

- [10/25/2022]
    - Converted project to a "single" file structure - An HTML file, a CSS file, and a scripts file - to replace React.js and .NET backend.
        - React.js and a dedicated backend is overkill for this project. Keepin' it simple.
    - Will need to rebuild the logic to generate the list of tracks on the page to run without React.js.
- [10/20/2022]
    - Moved logic for sorting tracks into TrackList.js and out of TrackInfo.js.
    - Added buttons to the control box.
    - Added the baseline level of CSS styling to the control box.
    - Need to:
        - Get the control box's top row to display a different message depending on where in the control box the user is hovering. Will need to use JavaScript for this.
        - Then, make the control box repositionable.
- [10/18/2022]
    - Broke the TrackList.js component out into two separate components: TrackList.js and TrackInfo.js.
    - Added sorting logic to sort the tracks list so the tracks show up in alphabetical order on the frontend.
    - Added control box and set it up to be positioned dynamically on the screen. It can't be drug around yet though.
        - The next step is to add the individual boxes inside the control box.
        - Then, the control box should be made to be repositionable. Note that the original Vidya Player allows you to move the box, but that the box can only be drug around by the top bar in the box.
- [10/16/2022]
    - The navigation bar is complete, the backend server is setup (The frontend also has its own server. Not sure how?), and dummy tracks data (dummyData.js) has been added to test the tracks list on the frontend.
    - Need to:
        - Setup the draggable controls box (play, pause, skip track, etc.)
        - Figure out how to get the backend (.NET server) to serve the React.js frontend.
        - Figure out how to serve audio files from the backend to the frontend. What does putting them into the "public" directory do? Do they automatically get an API or is the whole public directory served to, and downloaded by, the frontend when the page loads?
