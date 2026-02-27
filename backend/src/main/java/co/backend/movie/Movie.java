package co.backend.movie;

import co.backend.genre.Genre;
import co.backend.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "movie")
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] image;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(columnDefinition = "LONGBLOB")
    private byte[] script;

    @ManyToMany
    @JoinTable(name = "movie_genre",
            joinColumns = @JoinColumn(name = "movie_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id"))
    private List<Genre> genres = new ArrayList<>();

    @ManyToMany(mappedBy = "movies")
    private List<User> users = new ArrayList<>();

}
