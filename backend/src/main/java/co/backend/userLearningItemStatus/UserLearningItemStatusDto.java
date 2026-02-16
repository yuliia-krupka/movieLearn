package co.backend.userLearningItemStatus;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserLearningItemStatusDto {
    private Long learningItemId;
    private LearningStatus status;
    private Integer correctAnswers;
    private Integer totalAttempts;
}
