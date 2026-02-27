package co.backend.userLearningSet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLearningSetRepository extends JpaRepository<UserLearningSet, Long> {
    Optional<UserLearningSet> findByUserIdAndLearningSetId(Long userId, Long learningSetId);

    Optional<UserLearningSet> findByUserIdAndLearningSetMovieId(Long userId, Long movieId);

    @Query("SELECT uls FROM UserLearningSet uls " +
            "JOIN FETCH uls.learningSet ls " +
            "LEFT JOIN FETCH ls.movie " +
            "WHERE uls.user.id = :userId")
    List<UserLearningSet> findAllByUserIdWithLearningSetAndMovie(@Param("userId") Long userId);

    void deleteByUserId(Long userId);
}