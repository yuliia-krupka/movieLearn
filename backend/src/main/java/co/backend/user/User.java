package co.backend.user;

import co.backend.movie.Movie;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String lastname;
    private String email;
    @Lob
    private byte[] photo;

    @Enumerated(EnumType.STRING)
    private EnglishLevel englishLevel;

    @Column(columnDefinition = "TEXT")
    private String interests;

    @Enumerated(EnumType.STRING)
    private Role role;

}
