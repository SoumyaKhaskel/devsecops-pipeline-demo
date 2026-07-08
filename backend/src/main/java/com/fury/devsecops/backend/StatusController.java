package com.fury.devsecops.backend;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class StatusController {

    @GetMapping("/api/status")
    public Map<String, Object> getStatus() {
        return Map.of(
            "service", "devsecops-backend",
            "status", "UP",
            "timestamp", Instant.now().toString()
        );
    }
}
