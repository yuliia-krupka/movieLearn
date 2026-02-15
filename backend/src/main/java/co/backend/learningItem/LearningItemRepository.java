package co.backend.learningItem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningItemRepository extends JpaRepository<LearningItem, Long> {
    List<LearningItem> findByLearningSetId(Long learningSetId);
}