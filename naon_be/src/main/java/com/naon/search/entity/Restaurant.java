package com.naon.search.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "restaurants")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String image;
    private String hours;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double rating;
    private Double latitude;
    private Double longitude;

    @ManyToMany
    @JoinTable(
            name = "restaurant_filters",
            joinColumns = @JoinColumn(name = "restaurant_id"),
            inverseJoinColumns = @JoinColumn(name = "filter_id")
    )
    private List<Filter> filters;
}