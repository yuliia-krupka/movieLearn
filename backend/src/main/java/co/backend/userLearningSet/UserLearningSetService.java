package co.backend.userLearningSet;

import co.backend.learningSet.LearningSetRepository;
import co.backend.user.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@AllArgsConstructor
@Transactional
public class UserLearningSetService {

    private final UserLearningSetRepository userLearningSetRepository;
    private final UserRepository userRepository;
    private final LearningSetRepository learningSetRepository;

    public UserLearningSet getOrCreate(Long userId, Long learningSetId) {
        return userLearningSetRepository.findByUserIdAndLearningSetId(userId, learningSetId)
                .orElseGet(() -> {
                    UserLearningSet uls = new UserLearningSet();
                    uls.setUser(userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found")));
                    uls.setLearningSet(learningSetRepository.findById(learningSetId)
                            .orElseThrow(() -> new RuntimeException("Learning set not found")));
                    uls.setFlashcardsCompleted(false);
                    uls.setTestsCompleted(false);
                    uls.setFlashcardsScore(0);
                    uls.setTestsScore(0);
                    return userLearningSetRepository.save(uls);
                });
    }

    public UserLearningSet completeFlashcards(Long userId, Long learningSetId, int score) {
        UserLearningSet uls = getOrCreate(userId, learningSetId);
        uls.setFlashcardsCompleted(true);
        uls.setFlashcardsScore(score);
        return userLearningSetRepository.save(uls);
    }

    public UserLearningSet completeTests(Long userId, Long learningSetId, int score) {
        UserLearningSet uls = getOrCreate(userId, learningSetId);
        uls.setTestsCompleted(true);
        uls.setTestsScore(score);
        return userLearningSetRepository.save(uls);
    }

    public Optional<UserLearningSet> getByUserAndMovie(Long userId, Long movieId) {
        return userLearningSetRepository.findByUserIdAndLearningSetMovieId(userId, movieId);
    }
}