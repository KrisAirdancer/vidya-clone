package vidyaBackend.backend.controllers;

import java.io.*;
import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;

@RestController
public class vidyaController
{
	public final String PLAYLISTS_DIR = "src/main/data/playlists/";
	public final String DATA_DIR = "src/main/data/";

	// TODO: Ultimately, delete this method once it is done being used for testing.
    @GetMapping("/test")
	public String test()
	{
		return "It worked!";
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

	// TODO: Write doc.
	/**
	 * Returns a JSON representation of the list of trackIDs stored in the requested playlist file.
	 * 
	 * @param listName The name of the playlist to be returned.
	 * @return A JSON representation of the trackIDs stored in the playlist associated with listName.
	 */
	@GetMapping("/list/{listName}")
	public ResponseEntity<List<String>> getPlaylist(@PathVariable(value="listName") String listName)
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
}
