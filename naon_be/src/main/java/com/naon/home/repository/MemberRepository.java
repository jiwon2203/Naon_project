package com.naon.home.repository;

import com.naon.home.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Integer> {
    Optional<Member> findByMid(String id);
    boolean existsByMid(String id);
}
