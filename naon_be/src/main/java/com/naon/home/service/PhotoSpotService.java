package com.naon.home.service;

import com.naon.home.dto.PhotoSpotDTO;
import com.naon.home.entity.PhotoSpot;
import com.naon.home.entity.Tag;
import com.naon.home.repository.PhotoSpotRepository;
import com.naon.home.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhotoSpotService {
    private final PhotoSpotRepository photoSpotRepository;
    private final TagRepository tagRepository;


    private PhotoSpotDTO toDTO(PhotoSpot e)
    {
        return PhotoSpotDTO.builder()
                .id(e.getId())
                .spotNm(e.getSpotNm())
                .photoImg(e.getPhotoImg())
                .detailUrl(e.getDetailUrl())
                .placeDesc(e.getPlaceDesc())
                .category(e.getCategory())
                .gugunNm(e.getGugunNm())
                .lat(e.getLat())
                .lon(e.getLon())
                .openHours(e.getOpenHours())
                .charge(e.getCharge())
                .rating(e.getRating())
                .tags(e.getTags().stream().map(Tag::getName).toList())
                .build();
    }

    // 가까운 거리 순
    public List<PhotoSpotDTO> getNearest(double lat, double lon, int limit) {
        return photoSpotRepository.findAll().stream()
                .filter(ps -> ps.getLat() != null && ps.getLon() != null)
                .sorted(Comparator.comparingDouble(ps ->
                        distanceKm(lat, lon,
                                ps.getLat().doubleValue(),
                                ps.getLon().doubleValue())))
                .limit(Math.max(0, limit))
                .map(this::toDTO)
                .toList();
    }

    private double distanceKm(double lat, double lon, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat);
        double dLon = Math.toRadians(lon2 - lon);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // 카테고리 별
    public List<PhotoSpotDTO> getByCategory(String category) {
        return photoSpotRepository.findByCategoryIgnoreCase(category).stream().map(this::toDTO).toList();
    }

    // 해시태그 별
    public List<PhotoSpotDTO> getByTag(String tag) {
        String clean = (tag == null) ? "" : tag.replace("#", "").trim();
        if (clean.isEmpty()) return List.of();
        return photoSpotRepository.findDistinctByTags_NameIgnoreCase(clean)
                .stream()
                .map(this::toDTO)
                .toList();
    }
}
