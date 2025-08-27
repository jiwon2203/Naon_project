package com.naon.home.repository;

import com.naon.home.entity.PhotoSpot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PhotoSpotRepository extends JpaRepository<PhotoSpot, Long> {
    Optional<PhotoSpot> findBySpotNm(String spotNm);
    List<PhotoSpot> findByCategoryIgnoreCase(String category);
    List<PhotoSpot> findDistinctByTags_NameIgnoreCase(String name);
}
