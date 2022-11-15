package vidyaBackend.backend.controllers;

import java.io.Console;
import java.io.File;
import java.util.ArrayList;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class vidyaController
{
	public final String PLAYLISTS_DIR = "src/main/data/playlists/";

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
}
