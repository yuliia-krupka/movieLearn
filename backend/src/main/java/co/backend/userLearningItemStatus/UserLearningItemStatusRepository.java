package co.backend.userLearningItemStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLearningItemStatusRepository extends JpaRepository<UserLearningItemStatus, Long> {
    @Query("SELECT ulis FROM UserLearningItemStatus ulis " +
            "JOIN FETCH ulis.learningItem li " +
            "WHERE ulis.user.id = :userId AND li.learningSet.id = :learningSetId")
    List<UserLearningItemStatus> findByUserIdAndLearningItemLearningSetId(@Param("userId") Long userId,
                                                                          @Param("learningSetId") Long learningSetId);

    Optional<UserLearningItemStatus> findByUserIdAndLearningItemId(Long userId, Long learningItemId);

    void deleteByUserId(Long userId);
}