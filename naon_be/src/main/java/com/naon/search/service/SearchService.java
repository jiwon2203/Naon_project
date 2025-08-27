package com.naon.search.service;

import com.naon.search.dto.RestaurantResponse;
import com.naon.search.entity.Filter;
import com.naon.search.entity.Restaurant;
import com.naon.search.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final RestaurantRepository restaurantRepository;

    public List<RestaurantResponse> getRestaurantList(String latitude, String longitude, String keyword, List<String> filters) {
        // 식당 전체 조회
        List<Restaurant> allRestaurants = restaurantRepository.findAll();

        double lat = Double.parseDouble(latitude);
        double lng = Double.parseDouble(longitude);
        double radiusKm = 10.0;

        return allRestaurants.stream()
                // 거리 필터링
                .filter(r -> calculateDistance(lat, lng, r.getLatitude(), r.getLongitude()) <= radiusKm)
                // 키워드 필터링 (가게명, 설명)
                .filter(r -> keyword == null || keyword.isBlank()
                        || r.getName().toLowerCase().contains(keyword.toLowerCase())
                )
                // 필터 조건 (모든 선택 필터를 만족해야 함)
                .filter(r -> {
                    if (filters == null || filters.isEmpty()) return true;
                    List<String> restaurantFilterNames = r.getFilters().stream()
                            .map(Filter::getName)
                            .toList();
                    return restaurantFilterNames.containsAll(filters);
                })
                .map(RestaurantResponse::fromEntity)
                // 평점 순 정렬 (내림차순)
                .sorted((a, b) -> Double.compare(b.getRating(), a.getRating()))
                .collect(Collectors.toList());
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c;
    }
}
