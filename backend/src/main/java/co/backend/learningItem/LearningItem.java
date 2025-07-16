package co.backend.learningItem;

import co.backend.learningSet.LearningSet;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "learning_item")
@Data
@NoArgsConstructor
public class LearningItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private LearningItemType type;

    @Column(nullable = false)
    private String text;

    private List<String> answers;

    private String exampleSentence;

    private String translation;

    @ManyToOne
    @JoinColumn(name = "learning_set_id")
    private LearningSet learningSet;
}
