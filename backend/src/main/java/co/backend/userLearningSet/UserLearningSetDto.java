package co.backend.userLearningSet;

import lombok.Data;

@Data
public class UserLearningSetDto {
    private Long id;
    private Long userId;
    private Long learningSetId;
    private Integer flashcardsScore;
    private Integer testsScore;
}