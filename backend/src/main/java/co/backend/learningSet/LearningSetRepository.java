package co.backend.learningSet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LearningSetRepository extends JpaRepository<LearningSet, Long> {
    Optional<LearningSet> findTopByMovieIdAndCreatorIdOrderByDateDesc(Long movieId, Long creatorId);


    void deleteByCreatorId(Long creatorId);

    void deleteByMovieIdAndCreatorId(Long movieId, Long creatorId);

    void deleteByMovieId(Long movieId);
}