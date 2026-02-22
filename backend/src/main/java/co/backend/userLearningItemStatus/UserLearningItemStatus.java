package co.backend.userLearningItemStatus;

import co.backend.learningItem.LearningItem;
import co.backend.learningSet.LearningSet;
import co.backend.user.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
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
    @JsonIgnoreProperties({"role", "profilePictureUrl"})
    private User user;

    @ManyToOne
    @JoinColumn(name = "learning_item_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnoreProperties({"learningSet"})
    private LearningItem learningItem;

    @ManyToOne
    @JoinColumn(name = "learning_set_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnoreProperties({"learningItems"})
    private LearningSet learningSet;

    @Enumerated(EnumType.STRING)
    private LearningStatus status;

    private Integer correctAnswers;

    private Integer totalAttempts;

    private LocalDateTime lastAttemptAt;
}