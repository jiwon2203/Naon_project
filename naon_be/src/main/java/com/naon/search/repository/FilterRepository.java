package com.naon.search.repository;

import com.naon.search.entity.Filter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FilterRepository extends JpaRepository<Filter, Long> {

    Filter findByName(String name);
}
