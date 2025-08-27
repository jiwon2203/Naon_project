package com.naon.home.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name="users")
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int mno;

    @Column(unique = true, nullable = false)
    private String mid;

    @Column(nullable = false)
    private String mpw;

    private String memail;
    private String mname;

    @CreationTimestamp
    private LocalDateTime createDate;

    @UpdateTimestamp
    private LocalDateTime updateDate;
}
