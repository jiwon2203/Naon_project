package com.naon.map.controller;

import com.naon.map.entity.Location;
import com.naon.map.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/location")
@CrossOrigin(origins = "*") // 프론트 통신 허용 (개발용)
public class LocationController {

    @Autowired
    private LocationRepository locationRepository;

    @GetMapping
    public String getLocation() {
        return "GET 요청을 처리하는 메서드입니다.";
    }

    @PostMapping
    public String receiveLocation(@RequestBody Location location) {
        location.setTimestamp(LocalDateTime.now());
        locationRepository.save(location);
        return "위치 저장 완료";
    }
}