package co.backend.userLearningSet;

import co.backend.userLearningSet.dto.MovieProgressDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserLearningSetMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "learningSet.id", target = "learningSetId")
    UserLearningSetDto toDto(UserLearningSet entity);

    @Mapping(source = "uls.learningSet.id", target = "learningSetId")
    @Mapping(source = "uls.learningSet.movie.id", target = "movieId")
    @Mapping(source = "uls.learningSet.movie.title", target = "movieTitle")
    @Mapping(source = "uls.learningSet.movie.image", target = "movieImage")
    @Mapping(source = "uls.flashcardsCompleted", target = "flashcardsCompleted")
    @Mapping(source = "uls.testsCompleted", target = "testsCompleted")
    @Mapping(source = "uls.flashcardsAttempts", target = "flashcardsAttempts")
    @Mapping(source = "uls.testsAttempts", target = "testsAttempts")
    @Mapping(source = "uls.testsScore", target = "testsScore", defaultValue = "0")
    @Mapping(target = "totalWords", ignore = true)
    @Mapping(target = "learnedWords", ignore = true)
    @Mapping(target = "correctAnswers", ignore = true)
    @Mapping(target = "totalAttempts", ignore = true)
    @Mapping(target = "lastAttemptAt", ignore = true)
    @Mapping(target = "flashcardsScore", ignore = true)
    MovieProgressDto toProgressDtoBase(UserLearningSet uls);

    default MovieProgressDto toProgressDto(
            UserLearningSet uls,
            long totalWords,
            long learnedWords,
            int correctAnswers,
            int totalAttempts,
            java.time.LocalDateTime lastAttemptAt,
            int flashcardScorePct) {
        var dto = toProgressDtoBase(uls);
        dto.setTotalWords(totalWords);
        dto.setLearnedWords(learnedWords);
        dto.setCorrectAnswers(correctAnswers);
        dto.setTotalAttempts(totalAttempts);
        dto.setLastAttemptAt(lastAttemptAt);
        dto.setFlashcardsScore(flashcardScorePct);
        if (uls.getTestsScore() != null) {
            dto.setTestsScore(uls.getTestsScore());
        } else {
            dto.setTestsScore(0);
        }
        return dto;
    }
}
