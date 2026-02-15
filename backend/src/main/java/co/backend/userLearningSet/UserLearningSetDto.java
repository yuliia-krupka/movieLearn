package co.backend.userLearningSet;

import lombok.Data;

@Data
public class UserLearningSetDto {
    private Long id;
    private Long userId;
    private Long learningSetId;
    private boolean flashcardsCompleted;
    private boolean testsCompleted;
    private Integer flashcardsScore;
    private Integer testsScore;
}