package com.naon.home.controller;

import com.naon.home.dto.TourDTO;
import com.naon.home.service.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tour")
@RequiredArgsConstructor
public class TourController {
    private final TourService tourService;

    @GetMapping
    public List<TourDTO> getTours(
            @RequestParam(defaultValue = "전체") String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLon
    ) {
        return tourService.getTours(category, page, size, userLat, userLon);
    }

}
