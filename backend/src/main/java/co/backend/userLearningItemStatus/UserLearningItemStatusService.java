package co.backend.userLearningItemStatus;

import co.backend.learningItem.LearningItemRepository;
import co.backend.user.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class UserLearningItemStatusService {

    private final UserLearningItemStatusRepository statusRepository;
    private final UserRepository userRepository;
    private final LearningItemRepository learningItemRepository;

    public UserLearningItemStatus recordAnswer(Long userId, Long learningItemId, boolean correct) {
        UserLearningItemStatus status = statusRepository
                .findByUserIdAndLearningItemId(userId, learningItemId)
                .orElseGet(() -> {
                    UserLearningItemStatus newStatus = new UserLearningItemStatus();
                    newStatus.setUser(userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found")));
                    var learningItem = learningItemRepository.findById(learningItemId)
                            .orElseThrow(() -> new RuntimeException("Learning item not found"));
                    newStatus.setLearningItem(learningItem);
                    newStatus.setLearningSet(learningItem.getLearningSet());
                    newStatus.setCorrectAnswers(0);
                    newStatus.setTotalAttempts(0);
                    newStatus.setStatus(LearningStatus.IN_PROGRESS);
                    return newStatus;
                });

        status.setTotalAttempts(status.getTotalAttempts() + 1);
        if (correct) {
            status.setCorrectAnswers(status.getCorrectAnswers() + 1);
        } else {
            status.setCorrectAnswers(0);
            status.setStatus(LearningStatus.IN_PROGRESS);
        }

        if (status.getCorrectAnswers() >= 3) {
            status.setStatus(LearningStatus.LEARNED);
        }

        return statusRepository.save(status);
    }

    public List<UserLearningItemStatus> getStatusesByLearningSet(Long userId, Long learningSetId) {
        return statusRepository.findByUserIdAndLearningItemLearningSetId(userId, learningSetId);
    }
}