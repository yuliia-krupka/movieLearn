package co.backend.learningSet;

import co.backend.learningItem.LearningItem;
import co.backend.movie.Movie;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
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

    @OneToMany(mappedBy = "learningSet", cascade = CascadeType.ALL)
    private List<LearningItem> learningItems;
}
