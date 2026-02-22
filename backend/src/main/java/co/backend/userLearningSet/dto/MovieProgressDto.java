package co.backend.userLearningSet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieProgressDto {
    private Long movieId;
    private Long learningSetId;
    private String movieTitle;
    private byte[] movieImage;
    private boolean flashcardsCompleted;
    private boolean testsCompleted;
    private Integer flashcardsScore;
    private Integer testsScore;
    private long totalWords;
    private long learnedWords;
    private Integer correctAnswers;
    private Integer totalAttempts;
    private LocalDateTime lastAttemptAt;
    private Integer flashcardsAttempts;
    private Integer testsAttempts;
}
