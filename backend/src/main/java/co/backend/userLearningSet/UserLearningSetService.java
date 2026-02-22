package co.backend.userLearningSet;

import co.backend.learningSet.LearningSetRepository;
import co.backend.user.UserRepository;
import co.backend.userLearningItemStatus.UserLearningItemStatus;
import co.backend.userLearningItemStatus.UserLearningItemStatusRepository;
import co.backend.userLearningItemStatus.LearningStatus;
import co.backend.userLearningSet.dto.MovieProgressDto;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Transactional
public class UserLearningSetService {

    private final UserLearningSetRepository userLearningSetRepository;
    private final UserRepository userRepository;
    private final LearningSetRepository learningSetRepository;
    private final UserLearningItemStatusRepository statusRepository;
    private final UserLearningSetMapper userLearningSetMapper;

    public UserLearningSetDto getOrCreate(Long userId, Long learningSetId) {
        return userLearningSetMapper.toDto(getOrCreateEntity(userId, learningSetId));
    }

    private UserLearningSet getOrCreateEntity(Long userId, Long learningSetId) {
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

    public UserLearningSetDto completeFlashcards(Long userId, Long learningSetId, int score) {
        UserLearningSet uls = getOrCreateEntity(userId, learningSetId);
        uls.setFlashcardsCompleted(true);
        uls.setFlashcardsScore(score);
        uls.setFlashcardsAttempts(uls.getFlashcardsAttempts() != null ? uls.getFlashcardsAttempts() + 1 : 1);
        return userLearningSetMapper.toDto(userLearningSetRepository.save(uls));
    }

    public UserLearningSetDto completeTests(Long userId, Long learningSetId, int score) {
        UserLearningSet uls = getOrCreateEntity(userId, learningSetId);
        uls.setTestsCompleted(true);
        uls.setTestsScore(score);
        uls.setTestsAttempts(uls.getTestsAttempts() != null ? uls.getTestsAttempts() + 1 : 1);
        return userLearningSetMapper.toDto(userLearningSetRepository.save(uls));
    }

    public Optional<UserLearningSetDto> getByUserAndMovie(Long userId, Long movieId) {
        return userLearningSetRepository.findByUserIdAndLearningSetMovieId(userId, movieId)
                .map(userLearningSetMapper::toDto);
    }

    public List<MovieProgressDto> getUserProgressSummary(Long userId) {
        return userLearningSetRepository.findAllByUserId(userId).stream()
                .map(uls -> {
                    var set = uls.getLearningSet();
                    var movie = set.getMovie();

                    var statuses = statusRepository.findByUserIdAndLearningItemLearningSetId(userId, set.getId());
                    long totalWords = set.getLearningItems().stream()
                            .filter(item -> item.getType() == co.backend.learningItem.LearningItemType.FLASH_CARD)
                            .count();
                    long learnedWords = statuses.stream()
                            .filter(s -> s.getStatus() == LearningStatus.LEARNED)
                            .filter(s -> s.getLearningItem()
                                    .getType() == co.backend.learningItem.LearningItemType.FLASH_CARD)
                            .count();

                    int correctAnswers = (int) statuses.stream()
                            .mapToLong(s -> s.getCorrectAnswers() != null ? s.getCorrectAnswers() : 0)
                            .sum();
                    int totalAttempts = (int) statuses.stream()
                            .mapToLong(s -> s.getTotalAttempts() != null ? s.getTotalAttempts() : 0)
                            .sum();
                    java.time.LocalDateTime lastAttemptAt = statuses.stream()
                            .map(UserLearningItemStatus::getLastAttemptAt)
                            .filter(java.util.Objects::nonNull)
                            .max(java.util.Comparator.naturalOrder())
                            .orElse(null);

                    int flashcardScorePct;
                    if (uls.isFlashcardsCompleted() && uls.getFlashcardsScore() != null) {
                        flashcardScorePct = uls.getFlashcardsScore();
                        System.out.println("[DEBUG STATS] Using session completion score: " + flashcardScorePct + "%");
                    } else {
                        flashcardScorePct = totalWords > 0
                                ? (int) Math.round(((double) learnedWords / totalWords) * 100)
                                : 0;
                        System.out.println("[DEBUG STATS] Using individual progress score: " + flashcardScorePct + "%");
                    }

                    long totalTests = set.getLearningItems().stream()
                            .filter(item -> item.getType() == co.backend.learningItem.LearningItemType.TEST)
                            .count();
                    long correctTests = statuses.stream()
                            .filter(s -> s.getLearningItem().getType() == co.backend.learningItem.LearningItemType.TEST)
                            .filter(s -> s.getStatus() == LearningStatus.LEARNED)
                            .count();
                    int testScorePct = totalTests > 0 ? (int) Math.round(((double) correctTests / totalTests) * 100)
                            : 0;

                    if (movie != null) {
                        System.out.println("[DEBUG STATS] Movie: " + movie.getTitle() +
                                ", Words: " + learnedWords + "/" + totalWords + " (" + flashcardScorePct + "%)" +
                                ", Tests: " + correctTests + "/" + totalTests + " (" + testScorePct + "%)");
                    }

                    return userLearningSetMapper.toProgressDto(
                            uls,
                            totalWords,
                            learnedWords,
                            correctAnswers,
                            totalAttempts,
                            lastAttemptAt,
                            flashcardScorePct);
                })
                .toList();
    }
}