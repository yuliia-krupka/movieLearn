package co.backend.learningSet;

import co.backend.learningItem.LearningItem;
import co.backend.movie.Movie;
import co.backend.user.EnglishLevel;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "learning_set")
@Data
@NoArgsConstructor
public class LearningSet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private LocalDateTime date;

    @ManyToOne
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @OneToMany(mappedBy = "learningSet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LearningItem> learningItems = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private LearningSetStatus status;

    private Long creatorId;

    @Enumerated(EnumType.STRING)
    private EnglishLevel englishLevel;

    @Column(columnDefinition = "TEXT")
    private String interests;
}
