package co.backend.learningSet;

import co.backend.user.EnglishLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningSetRepository extends JpaRepository<LearningSet, Long> {
    Optional<LearningSet> findTopByMovieIdOrderByDateDesc(Long movieId);

    Optional<LearningSet> findTopByMovieIdAndCreatorIdOrderByDateDesc(Long movieId, Long creatorId);

    Optional<LearningSet> findTopByMovieIdAndCreatorIdAndEnglishLevelOrderByDateDesc(Long movieId, Long creatorId,
                                                                                     EnglishLevel englishLevel);

    Optional<LearningSet> findTopByMovieIdAndEnglishLevelAndInterestsOrderByDateDesc(Long movieId,
                                                                                     EnglishLevel englishLevel, String interests);

    List<LearningSet> findByMovieIdAndEnglishLevelOrderByDateDesc(Long movieId, EnglishLevel englishLevel);

    void deleteByCreatorId(Long creatorId);

    void deleteByMovieIdAndCreatorId(Long movieId, Long creatorId);

    void deleteByMovieId(Long movieId);
}