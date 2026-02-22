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
    @Mapping(source = "uls.learningSet.englishLevel", target = "englishLevel")
    @Mapping(target = "totalWords", ignore = true)
    @Mapping(target = "learnedWords", ignore = true)
    @Mapping(target = "totalAttempts", ignore = true)
    @Mapping(target = "lastAttemptAt", ignore = true)
    @Mapping(target = "flashcardsScore", ignore = true)
    MovieProgressDto toProgressDtoBase(UserLearningSet uls);

    default MovieProgressDto toProgressDto(
            UserLearningSet uls,
            long totalWords,
            long learnedWords,
            int totalSessionAttempts,
            java.time.LocalDateTime lastAttemptAt,
            int flashcardScorePct) {
        var dto = toProgressDtoBase(uls);
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
        return dto;
    }
}
