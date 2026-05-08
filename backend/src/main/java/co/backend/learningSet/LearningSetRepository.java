package co.backend.learningSet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningSetRepository extends JpaRepository<LearningSet, Long> {
    Optional<LearningSet> findTopByMovieIdAndCreatorIdOrderByDateDesc(Long movieId, Long creatorId);

    @Query("""
            SELECT ls.movie.id AS movieId, ls.englishLevel AS englishLevel
            FROM LearningSet ls
            WHERE ls.movie.id IN :movieIds
              AND ls.creatorId = :userId
              AND ls.date = (
                  SELECT MAX(ls2.date) FROM LearningSet ls2
                  WHERE ls2.movie.id = ls.movie.id AND ls2.creatorId = :userId
              )
            """)
    List<MovieEnglishLevelProjection> findLatestEnglishLevelsByMovieIds(
            @Param("movieIds") List<Long> movieIds,
            @Param("userId") Long userId);

    void deleteByCreatorId(Long creatorId);

    void deleteByMovieIdAndCreatorId(Long movieId, Long creatorId);

    void deleteByMovieId(Long movieId);

    interface MovieEnglishLevelProjection {
        Long getMovieId();

        co.backend.user.EnglishLevel getEnglishLevel();
    }
}