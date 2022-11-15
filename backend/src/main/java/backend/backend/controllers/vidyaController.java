package backend.backend.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class vidyaController
{
    @GetMapping("/test")
	public String test()
	{
		return "It worked!";
	}
}
