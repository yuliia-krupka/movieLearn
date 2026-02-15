package co.backend.userLearningSet;

import co.backend.learningSet.LearningSet;
import co.backend.user.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_learning_set")
@Data
@NoArgsConstructor
public class UserLearningSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "learning_set_id")
    private LearningSet learningSet;

    private boolean flashcardsCompleted;

    private boolean testsCompleted;

    private Integer flashcardsScore;

    private Integer testsScore;
}