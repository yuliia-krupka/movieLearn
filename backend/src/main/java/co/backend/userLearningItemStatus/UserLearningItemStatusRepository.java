package co.backend.userLearningItemStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLearningItemStatusRepository extends JpaRepository<UserLearningItemStatus, Long> {
    List<UserLearningItemStatus> findByUserIdAndLearningItemLearningSetId(Long userId, Long learningSetId);

    Optional<UserLearningItemStatus> findByUserIdAndLearningItemId(Long userId, Long learningItemId);

    void deleteByUserId(Long userId);
}