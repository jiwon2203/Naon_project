package com.naon.domitory.repository;

import com.naon.domitory.entity.Accommodation;
import org.springframework.data.jpa.domain.Specification;

public class AccommodationSpecs {

    public static Specification<Accommodation> hasType(String type) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("type"), type);
    }

    public static Specification<Accommodation> is24hFront() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("is24hFront"));
    }

    public static Specification<Accommodation> hasWifi() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("hasWifi"));
    }

    public static Specification<Accommodation> isNonSmoking() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("isNonSmoking"));
    }

    public static Specification<Accommodation> isGenderSeparatedRestroom() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("isGenderSeparatedRestroom"));
    }

    public static Specification<Accommodation> hasPrivateEntrance() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("hasPrivateEntrance"));
    }
}