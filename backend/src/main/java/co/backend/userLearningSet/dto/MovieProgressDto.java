package co.backend.userLearningSet.dto;

import co.backend.user.EnglishLevel;
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
    private Integer tmdbId;
    private Integer flashcardsScore;
    private Integer testsScore;
    private long totalWords;
    private long learnedWords;
    private Integer totalAttempts;
    private LocalDateTime lastAttemptAt;
    private EnglishLevel englishLevel;
}
