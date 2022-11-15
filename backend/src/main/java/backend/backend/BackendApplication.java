package backend.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// TODO: Break all routing logic out into a controller class. It doesn't belong in here.

@RestController
@SpringBootApplication
public class BackendApplication
{

	public static void main(String[] args)
	{
		SpringApplication.run(BackendApplication.class, args);
	}

	@GetMapping("/test")
	public String test()
	{
		return "It worked!";
	}

}
