package com.naon.home.controller;

import com.naon.home.dto.PhotoSpotDTO;
import com.naon.home.service.PhotoSpotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/photospots")
@RequiredArgsConstructor
public class PhotoSpotController {

    private final PhotoSpotService photoSpotService;

    // 전체: 가까운 거리 순으로 장소 10곳
    @GetMapping("/all")
    public ResponseEntity<List<PhotoSpotDTO>> getNearbySpots(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10") int limit
    ){
        return ResponseEntity.ok(photoSpotService.getNearest(lat,lon,limit));
    }

    // category 버튼 클릭 시 해당 카테고리의 장소만 나열
    @GetMapping("/category")
    public  ResponseEntity<List<PhotoSpotDTO>> getByCategory(@RequestParam String category){
        return ResponseEntity.ok(photoSpotService.getByCategory(category));
    }

    // 해시태그 클릭 시 해시태그 포함한 장소만 나열
    @GetMapping("/tag")
    public ResponseEntity<List<PhotoSpotDTO>> getByTag(@RequestParam String tag){
        return ResponseEntity.ok(photoSpotService.getByTag(tag));
    }
}
