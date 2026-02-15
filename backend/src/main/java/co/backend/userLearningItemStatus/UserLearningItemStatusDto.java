package co.backend.userLearningItemStatus;

import lombok.Data;

@Data
public class UserLearningItemStatusDto {
    private Long id;
    private Long userId;
    private Long learningItemId;
    private LearningStatus status;
    private Integer correctAnswers;
    private Integer totalAttempts;
}
