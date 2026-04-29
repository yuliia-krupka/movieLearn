package co.backend.userLearningSet;

import co.backend.userLearningSet.dto.MovieProgressDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class MovieProgressMapper {

    private final UserLearningSetMapper userLearningSetMapper;

    public MovieProgressDto toProgressDto(
            UserLearningSet uls,
            long totalWords,
            long learnedWords,
            int totalSessionAttempts,
            LocalDateTime lastAttemptAt,
            int flashcardScorePct) {
        var dto = userLearningSetMapper.toProgressDtoBase(uls);
        dto.setTotalWords(totalWords);
        dto.setLearnedWords(learnedWords);
        dto.setTotalAttempts(totalSessionAttempts);
        dto.setLastAttemptAt(lastAttemptAt);
        dto.setFlashcardsScore(flashcardScorePct);
        if (uls.getTestsScore() != null) {
            dto.setTestsScore(uls.getTestsScore());
        } else {
            dto.setTestsScore(0);
        }
        var movie = uls.getLearningSet().getMovie();
        if (movie != null) {
            if (movie.getImageData() != null && movie.getImageData().length > 0) {
                dto.setImage("data:image/jpeg;base64," +
                        java.util.Base64.getEncoder().encodeToString(movie.getImageData()));
            } else {
                dto.setImage("/abstract/abstract-" + (((movie.getId() * 7) % 10) + 1) + ".svg");
            }
        }
        return dto;
    }
}
