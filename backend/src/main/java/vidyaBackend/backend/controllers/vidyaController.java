package vidyaBackend.backend.controllers;

import java.io.*;
import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.google.gson.Gson;

import vidyaBackend.backend.models.PutListBody;

@RestController
public class vidyaController
{
	public final String PLAYLISTS_DIR = "src/main/data/playlists/";
	public final String DATA_DIR = "src/main/data/";

	public int chosenProbability = 25;; // Integer value between 0 and 100. Defaults to 25.

	public HashSet<String> chosenTracks = new HashSet<String>();
	public HashSet<String> normalTracks = new HashSet<String>();
	public HashSet<String> exiledTracks = new HashSet<String>();

	public vidyaController()
	{
		populateListSet("chosen");
		populateListSet("exiled");
		populateNormalTracksSet();

		// TODO: Implement logic to change chosenProbability to the saved value.
	}

	/***** ROUTING *****/

	// TODO: Ultimately, delete this method once it is done being used for testing.
    @GetMapping("/test")
	public String test()
	{
		return "It worked!";
	}

	@GetMapping("/next-track")
	public String getNextTrack()
	{
		// TODO: Implement getNextTrack()

		// Decide between a chosen track and all other tracks.
			// Decision made based on the probability of selecting a chosen track.
			// Will need to store that probability so that it persists. In the absence of a database, can either store this in its own .txt file or as the first entry in the chosen-tracks.csv file.
		// If chosen,
			// Choose only from the list of Chosen tracks
		// If non-chosen,
			// Choose only from the list of non-Chosen and non-exiled tracks (choose from normalTracks).

		return "0000";
	}

	/**
	 * Generates a list of playlist names representing the list of playlits available
	 * in the system (in the directory specified by PLAYLISTS_DIR).
	 * 
	 * @return A list of playlists currently available in the PLAYLISTS_DIR directory.
	 */
	@GetMapping("/playlists")
	public ResponseEntity<ArrayList<String>> getListOfPlaylists()
	{
		File targetDir = new File(PLAYLISTS_DIR);
		File[] files = targetDir.listFiles();

		ArrayList<String> playlists = new ArrayList<String>();

		for (int i = 0; i < files.length; i++)
		{
			playlists.add(files[i].getName().split("-")[0]);
		}

		return ResponseEntity.ok(playlists);
	}

	/**
	 * Returns the contents of the specified playlist file.
	 * 
	 * The playlistName needs to match one of the available playlists exactly. Currently"vip" or "mellow".
	 * 
	 * Note: Playlists are not build by the user of the vidya-player. Instead, the playlists
	 * are built and maintained by the Web Master. Thus, there is only a route to get the
	 * playlists and no routes to modify them.
	 * 
	 * @param playlistName The name of the playlist to be returned.
	 * @return The trackIDs of the tracks in the specified playlist.
	 */
	@GetMapping("/playlist/{playlistName}")
	public ResponseEntity<String> getPlaylist(@PathVariable(value="playlistName") String playlistName)
	{
		if (!playlistName.equals("mellow") && !playlistName.equals("vip"))
		{
			return new ResponseEntity<>("", HttpStatus.BAD_REQUEST);
		}

		File playlist = new File(PLAYLISTS_DIR + playlistName + "-playlist.csv");

		try {
			
			StringBuilder fileContents = new StringBuilder();

			BufferedReader reader = new BufferedReader(new FileReader(playlist));

			String line;
			while ((line = reader.readLine()) != null)
			{
				fileContents.append(line);
			}
			
			reader.close();

			return new ResponseEntity<String>(fileContents.toString(), HttpStatus.OK);

		} catch (Exception e) {
			// TODO: Add logging here
			System.out.println(e.getMessage());

			return new ResponseEntity<String>("", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Returns a JSON representation of the list of trackIDs stored in the requested playlist file.
	 * 
	 * @param listName The name of the playlist to be returned.
	 * @return A JSON representation of the trackIDs stored in the playlist associated with listName.
	 */
	@GetMapping("/list/{listName}")
	public ResponseEntity<List<String>> getList(@PathVariable(value="listName") String listName)
	{
		if (!listName.equals("chosen") && !listName.equals("exiled"))
		{
			// TODO: Is returning an empty list like this the proper way to do this?
			return new ResponseEntity<List<String>>(new ArrayList<String>(), HttpStatus.BAD_REQUEST);
		}

		File playlist = new File(DATA_DIR + "/" + listName + "-tracks.csv");

		try {
			BufferedReader reader = new BufferedReader(new FileReader(playlist));

			String[] IDs = reader.readLine().split(",");
			reader.close();

			return new ResponseEntity<List<String>>(Arrays.asList(IDs), HttpStatus.OK);
			
		} catch (Exception e) {
			// TODO: Add logging here.
			System.out.println(e.getMessage());

			// TODO: Is returning an empty list like this the proper way to do this?
			return new ResponseEntity<List<String>>(new ArrayList<String>(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Returns a JSON representation of the contents of the tracks-master-list.json file.
	 * 
	 * @return A JSON representation of the coontents of the tracks-master-list.json file.
	 */
	@GetMapping("/master")
	public ResponseEntity<String> getMasterList()
	{
		File masterList = new File(DATA_DIR + "tracks-master-list.json");

		try {
			
			BufferedReader reader = new BufferedReader(new FileReader(masterList));

			StringBuilder fileContents = new StringBuilder();

			String line;
			while ((line = reader.readLine()) != null)
			{
				fileContents.append(line);
			}

			reader.close();

			return new ResponseEntity<String>(fileContents.toString(), HttpStatus.OK);

		} catch (Exception e) {
			// TODO: Add logging here.
			System.out.println(e.getMessage());

			return new ResponseEntity<String>("", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Updates the given list based on the request specifications:
	 * - Add/Remove track specified as "add"/"remove" in request body as "action".
	 * - List to modify specified as "chosen"/"exiled" in request body as "list".
	 * 
	 * The default action is "add".
	 * 
	 * Example:
	 * {
	 * 	  "list": "chosen",
	 *    "action": "add"
	 * }
	 * 
	 * @param trackID The trackID to be added/removed to/from the specified list.
	 * @param body Add/Remove action and list to modify are specified in request body.
	 */
	@PutMapping("/list/{trackID}")
	public void updateList(@PathVariable(value="trackID") String trackID, @RequestBody String body)
	{
		/***** Retreive Request Body *****/

		Gson gson = new Gson();

		PutListBody reqBody;
		try {
			reqBody = gson.fromJson(body, PutListBody.class);
		} catch (Exception e) {
			// TODO: Add logging here.
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "gson failure (E-0001)");
		}

		/***** Validate Request *****/

		// Validate request body
		if ((reqBody.list == null || reqBody.action == null) // Null fields check - for "key" values (from response) that don't map to a field in PutListBody objects
			 || (!reqBody.list.equals("chosen") && !reqBody.list.equals("exiled")) // "value" field checks - for invalid "value" field values
		     || (!reqBody.action.equals("add") && !reqBody.action.equals("remove")) // "value" field checks - for invalid "value" field values
		     || !trackID.matches("^[0-9]{4}$")) // Matchs a series of digits of length 4. ex. 0034
		{
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Improperly formatted request (E-0002)");
		}

		/***** Process Request *****/

		if (reqBody.list.equals("chosen"));
		{
			if (reqBody.action.equals("add")) // Add track
			{
				this.chosenTracks.add(trackID);
				this.exiledTracks.remove(trackID);
			}
			if (reqBody.action.equals("remove")) // Remove track
			{
				this.chosenTracks.remove(trackID);
			}
		}
		if (reqBody.list.equals("exiled"))
		{
			if (reqBody.action.equals("add"))
			{
				this.exiledTracks.add(trackID);
				this.chosenTracks.remove(trackID);
			}
			if (reqBody.action.equals("remove"))
			{
				this.exiledTracks.remove(trackID);
			}
		}

		/***** Write changes to list file *****/

		updateLists();
	}

	/**
	 * Deletes the tracks.csv file specified by listName
	 * 
	 * listName must match the prefix of the tracks list to be cleared exactly.
	 * Currently "chosen" and "exiled".
	 * 
	 * @param listName The tracklist to be deleted.
	 */
	@DeleteMapping("/reset/{listName}")
	public void resetList(@PathVariable(value="listName") String listName)
	{
		if (!listName.equals("chosen") && !listName.equals("exiled"))
		{
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Improperly formatted request (E-0003)");
		}

		/***** Clear the temporary data (HashSet) *****/

		if (listName.equals("chosen"))
		{
			this.chosenTracks.clear();
		}
		if (listName.equals("exiled"))
		{
			this.exiledTracks.clear();;
		}

		/***** Clear the persistant data (file) *****/

		File targetFile = new File(DATA_DIR + listName + "-tracks.csv");

		targetFile.delete();

		try {
			targetFile.createNewFile();

		} catch (IOException e) {
			// TODO Add logging here
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create new tracks file (E-0004)");
		}
	}

	/***** UTILITIES *****/

	// TODO: If the filename is wrong (where the File object is created), a 200 code is returned despite the Writer not being able to write to the non-extant file. Fix this - a 500 code needs to be returned.
	/**
	 * Writes the data in the chosenTracks and exiledTracks HashMaps to the
	 * CSV files on the system.
	 */
	public void updateLists()
	{
		File chosenList = new File(DATA_DIR + "chosen-tracks.csv");
		File exiledList = new File(DATA_DIR + "exiled-tracks.csv");

		try {
			
			BufferedWriter chosenWriter = new BufferedWriter(new FileWriter(chosenList));
			BufferedWriter exiledWriter = new BufferedWriter(new FileWriter(exiledList));

			StringBuilder chosen = new StringBuilder();
			StringBuilder exiled = new StringBuilder();

			if (!this.chosenTracks.isEmpty())
			{
				for (String track : this.chosenTracks)
				{
					chosen.append(track + ",");
				}

				chosen.deleteCharAt(chosen.length() - 1);
				chosenWriter.write(chosen.toString());
			}
			if (!this.exiledTracks.isEmpty())
			{
				for (String track : this.exiledTracks)
				{
					exiled.append(track + ",");
				}

				exiled.deleteCharAt(exiled.length() - 1);
				exiledWriter.write(exiled.toString());
			}

			chosenWriter.close();
			exiledWriter.close();

		} catch (Exception e) {
			// TODO: Add logging here
			System.out.println(e.getMessage());
			// TODO: Not sure if this is going to propogate up to the calling methods correctly. Check that it is and adjust as necessary.
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Populates the HashSet representations of the specified list (chosen/exiled)
	 * from the contents of the associated playlist CSV file.
	 * 
	 * @param list The list (chosen/exiled) to be populated.
	 */
	public void populateListSet(String list)
	{
		File chosenList = new File(DATA_DIR + list + "-tracks.csv");

		try {
			
			BufferedReader reader = new BufferedReader(new FileReader(chosenList));

			StringBuilder fileContents = new StringBuilder();

			String line;
			while ((line = reader.readLine()) != null)
			{
				fileContents.append(line);
			}

			reader.close();

			String[] IDs = fileContents.toString().split(",");

			for (String trackID : IDs)
			{
				// Empty string check
				if (trackID.equals("")) { continue; }

				if (list.equals("chosen"))
				{
					this.chosenTracks.add(trackID);
				}
				if (list.equals("exiled"))
				{
					this.exiledTracks.add(trackID);
				}
			}

		} catch (Exception e) {
			// TODO: Add logging here.
			System.out.println(e.getMessage());
		}
	}

	/**
	 * Populates the normalTracks HashSet from the data in the tracks-master-list.json file.
	 */
	public void populateNormalTracksSet()
	{
		StringBuilder tracksData = new StringBuilder();

		File masterList = new File(DATA_DIR + "tracks-master-list.json");

		try {
			
			BufferedReader reader = new BufferedReader(new FileReader(masterList));

			String line;
			while ((line = reader.readLine()) != null)
			{
				tracksData.append(line);
			}

			reader.close();

		} catch (Exception e) {
			// TODO: Add logging here.
			System.out.println(e.getMessage());
		}

		for (int i = 0; i < tracksData.length(); i++)
		{
			if (tracksData.charAt(i) == '['
			 || tracksData.charAt(i) == ']'
			 || tracksData.charAt(i) == '{'
			 || tracksData.charAt(i) == '}'
			 || tracksData.charAt(i) == '"'
			 || tracksData.charAt(i) == ' '
			 )
			{
				tracksData.deleteCharAt(i);
				i--; // Deleting a character is equivalent to i++, so we must i-- to ensure that we don't miss characters when the for loop does its i++.
			}
		}

		String[] trackTokens = tracksData.toString().split(",");

		for (String token : trackTokens)
		{
			if (token.contains("trackID"))
			{
				String ID = token.substring(token.indexOf(":") + 1, token.length());

				if (!chosenTracks.contains(ID) && !exiledTracks.contains(ID))
				{
					normalTracks.add(ID);
				}

			}
		}
	}
}

// TODO: Ultimately, replace the file-based data storage with a database.
// TODO: Add some form of authorization check - the frontend should send an auth-token to the backend. If the token isn't valid, the backend will reject the request.
// TODO: Add error numbers to all non-200 responses. Ex. (E-0001)