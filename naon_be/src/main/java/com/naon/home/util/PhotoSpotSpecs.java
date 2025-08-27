package com.naon.home.util;

import com.naon.home.entity.PhotoSpot;
import com.naon.home.entity.Tag;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class PhotoSpotSpecs {
    public static Specification<PhotoSpot> categoryEquals(String category) {
        return (root, query, cb) -> cb.equal(root.get("category"), category);
    }

    public static Specification<PhotoSpot> gugunEquals(String gugun) {
        return (root, query, cb) -> cb.equal(root.get("gugunNm"), gugun);
    }

    public static Specification<PhotoSpot> nameOrDescContains(String q) {
        final String like = "%" + q.trim() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(root.get("spotNm"), like),
                cb.like(root.get("placeDesc"), like)
        );
    }
    public static Specification<PhotoSpot> hasAnyTags(List<String> tagNames) {
        return (root, query, cb) -> {
            query.distinct(true);
            Join<PhotoSpot, Tag> tagJoin = root.join("tags");
            return tagJoin.get("name").in(tagNames);
        };
    }
}
