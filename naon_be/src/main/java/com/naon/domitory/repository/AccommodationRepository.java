package com.naon.domitory.repository;

import com.naon.domitory.entity.Accommodation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // 추가
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccommodationRepository extends JpaRepository<Accommodation, Integer>, JpaSpecificationExecutor<Accommodation> { // JpaSpecificationExecutor 추가

}