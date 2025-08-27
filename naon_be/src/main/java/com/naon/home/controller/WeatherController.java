package com.naon.home.controller;

import com.naon.home.dto.WeatherDTO;
import com.naon.home.service.WeatherService;
import com.naon.home.util.LatLonToGridConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class WeatherController {
    private final WeatherService weatherService;

    @GetMapping("/current")
    public ResponseEntity<WeatherDTO> getCurrentWeather(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon
    ) {
        double latitude = (lat != null && !lat.isNaN()) ? lat : 35.1796;
        double longitude = (lon != null && !lon.isNaN()) ? lon : 129.0756;

        int[] nxny = LatLonToGridConverter.convert(latitude, longitude);
        WeatherDTO weather = weatherService.fetchCurrentWeather(nxny[0], nxny[1]);
        return ResponseEntity.ok(weather);
    }
}
