package co.backend.userLearningSet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLearningSetRepository extends JpaRepository<UserLearningSet, Long> {
    Optional<UserLearningSet> findByUserIdAndLearningSetId(Long userId, Long learningSetId);

    Optional<UserLearningSet> findByUserIdAndLearningSetMovieId(Long userId, Long movieId);

    List<UserLearningSet> findAllByUserId(Long userId);
}