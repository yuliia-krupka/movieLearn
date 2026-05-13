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

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

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

    @OneToOne
    @JoinColumn(name = "movie_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Movie movie;

    @Column(name = "script_hash")
    private Integer scriptHash;

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
