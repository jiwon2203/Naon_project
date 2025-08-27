package com.naon.home.controller;

import com.naon.home.dto.WalkingDTO;
import com.naon.home.service.WalkingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/walkingRoute")
@RequiredArgsConstructor
public class WalkingController {
    private final WalkingService walkingService;

    // 카테고리 전체: 페이징 (한페이지당 20개씩)
    @GetMapping
    public List<WalkingDTO> getAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLon
    ) {
        return walkingService.getAll(page, size, userLat, userLon);
    }

    // 카테고리: 해안길/숲길/강변길/도심길 → ITEMCNTNTS에서 '해안', '숲', '강변', '도심' 단어 필터링
    @GetMapping("/category")
    public List<WalkingDTO> getByCategory(
            @RequestParam String type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLon
    ) {
        return walkingService.getByCategory(type, page, size, userLat, userLon);
    }

}
