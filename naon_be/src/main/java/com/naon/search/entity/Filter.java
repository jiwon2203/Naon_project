package com.naon.search.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "filters")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Filter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToMany(mappedBy = "filters")
    private List<Restaurant> restaurants;

}
