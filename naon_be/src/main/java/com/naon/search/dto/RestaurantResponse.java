package com.naon.search.dto;

import com.naon.search.entity.Filter;
import com.naon.search.entity.Restaurant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantResponse {
    private Long id;
    private String name;
    private String image;
    private String hours;
    private String description;
    private List<String> filters;
    private double rating;

    public static RestaurantResponse fromEntity(Restaurant restaurant) {
        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .image(restaurant.getImage())
                .hours(restaurant.getHours())
                .description(restaurant.getDescription())
                .filters(restaurant.getFilters()!= null ?
                        restaurant.getFilters().stream()
                                .map(Filter::getName)
                                .collect(Collectors.toList())
                        : new ArrayList<>())
                .rating(restaurant.getRating())
                .build();
    }
}
