package com.naon.home.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Objects;

@Entity
@Table(name = "tag",uniqueConstraints = @UniqueConstraint(columnNames = "name") )
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Tag tag)) return false;
        return Objects.equals(name != null ? name.toLowerCase() : null,
                tag.name != null ? tag.name.toLowerCase() : null);
    }
    @Override
    public int hashCode() {
        return Objects.hash(name != null ? name.toLowerCase() : null);
    }
}
