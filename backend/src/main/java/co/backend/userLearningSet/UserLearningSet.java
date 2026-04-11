package co.backend.userLearningSet;

import co.backend.learningSet.LearningSet;
import co.backend.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
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
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @ManyToOne
    @JoinColumn(name = "learning_set_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private LearningSet learningSet;

    private Integer flashcardsScore;

    private Integer testsScore;

    @Column(nullable = false, columnDefinition = "int default 0")
    private Integer flashcardsAttempts = 0;

    @Column(nullable = false, columnDefinition = "int default 0")
    private Integer testsAttempts = 0;
}