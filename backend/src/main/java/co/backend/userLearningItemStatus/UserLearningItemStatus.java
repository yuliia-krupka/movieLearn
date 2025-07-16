package co.backend.userLearningItemStatus;

import co.backend.learningItem.LearningItem;
import co.backend.learningSet.LearningSet;
import co.backend.user.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_learning_item_status")
@Data
@NoArgsConstructor
public class UserLearningItemStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "learning_item_id")
    private LearningItem learningItem;

    @ManyToOne
    @JoinColumn(name = "learning_set_id")
    private LearningSet learningSet;

    @Enumerated(EnumType.STRING)
    private LearningStatus status;

    private Integer attempts;

    private LocalDateTime lastAttemptAt;
}
