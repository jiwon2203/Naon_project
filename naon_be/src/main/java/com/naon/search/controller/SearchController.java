package com.naon.search.controller;

import com.naon.search.dto.ApiResponse;
import com.naon.search.dto.RestaurantResponse;
import com.naon.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/restaurant")
    private ResponseEntity<?> getRestaurantList(@RequestParam String latitude, @RequestParam String longitude, @RequestParam(required = false) String keyword, @RequestParam(required = false) String filters) {
        List<String> filterList = new ArrayList<>();

        if (filters != null && !filters.isEmpty()) {
            // 콤마(,) 기준
            filterList = Arrays.asList(filters.split("[,]+"));
        }

        List<RestaurantResponse> result = searchService.getRestaurantList(latitude, longitude, keyword, filterList);

        ApiResponse<List<RestaurantResponse>> response = ApiResponse.<List<RestaurantResponse>>builder()
                .status(200)
                .code("SUCCESS_SEARCH_RESTAURANT_LIST")
                .message("검색 결과를 조회했습니다.")
                .data(result)
                .build();

        return ResponseEntity.ok(response);
    }
}
