package co.backend.learningItem;

import co.backend.learningSet.LearningSet;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
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

    @ElementCollection
    @CollectionTable(name = "learning_item_answers", joinColumns = @JoinColumn(name = "learning_item_id"))
    @Column(name = "answer")
    private List<String> answers = new ArrayList<>();

    private String exampleSentence;

    private String transcription;

    private String translation;

    private Integer correctAnswerIndex;

    @ManyToOne
    @JoinColumn(name = "learning_set_id")
    private LearningSet learningSet;
}
