package co.backend.userLearningSet;

import co.backend.exceptions.NotFoundException;
import co.backend.learningSet.LearningSetRepository;
import co.backend.user.UserRepository;
import co.backend.userLearningItemStatus.UserLearningItemStatus;
import co.backend.userLearningItemStatus.UserLearningItemStatusRepository;
import co.backend.userLearningItemStatus.LearningStatus;
import co.backend.userLearningSet.dto.MovieProgressDto;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Objects;
import java.util.Comparator;

import co.backend.learningItem.LearningItemType;
import co.backend.learningSet.LearningSet;

@Service
@AllArgsConstructor
@Transactional
@lombok.extern.slf4j.Slf4j
public class UserLearningSetService {

    private final UserLearningSetRepository userLearningSetRepository;
    private final UserRepository userRepository;
    private final LearningSetRepository learningSetRepository;
    private final UserLearningItemStatusRepository statusRepository;
    private final UserLearningSetMapper userLearningSetMapper;
    private final MovieProgressMapper movieProgressMapper;

    public void getOrCreate(Long userId, Long learningSetId) {
        userLearningSetMapper.toDto(getOrCreateEntity(userId, learningSetId));
    }

    private UserLearningSet getOrCreateEntity(Long userId, Long learningSetId) {
        return userLearningSetRepository.findByUserIdAndLearningSetId(userId, learningSetId)
                .orElseGet(() -> {
                    LearningSet learningSet = learningSetRepository.findById(learningSetId)
                            .orElseThrow(() -> new NotFoundException("Learning set not found"));

                    if (learningSet.getMovie() != null) {
                        Long movieId = learningSet.getMovie().getId();
                        userLearningSetRepository.deleteByUserIdAndLearningSetMovieId(userId, movieId);
                        log.debug("Cleaned up old UserLearningSet records for userId={}, movieId={}", userId, movieId);
                    }

                    UserLearningSet uls = new UserLearningSet();
                    uls.setUser(userRepository.findById(userId)
                            .orElseThrow(() -> new NotFoundException("User not found")));
                    uls.setLearningSet(learningSet);
                    uls.setFlashcardsScore(0);
                    uls.setTestsScore(0);
                    return userLearningSetRepository.save(uls);
                });
    }

    public UserLearningSetDto completeFlashcards(Long userId, Long learningSetId, int score) {
        UserLearningSet uls = getOrCreateEntity(userId, learningSetId);
        uls.setFlashcardsScore(score);
        uls.setFlashcardsAttempts(uls.getFlashcardsAttempts() != null ? uls.getFlashcardsAttempts() + 1 : 1);
        return userLearningSetMapper.toDto(userLearningSetRepository.save(uls));
    }

    public UserLearningSetDto completeTests(Long userId, Long learningSetId, int score) {
        UserLearningSet uls = getOrCreateEntity(userId, learningSetId);
        uls.setTestsScore(score);
        uls.setTestsAttempts(uls.getTestsAttempts() != null ? uls.getTestsAttempts() + 1 : 1);
        return userLearningSetMapper.toDto(userLearningSetRepository.save(uls));
    }

    public void resetScoresIfIncomplete(Long userId, Long learningSetId) {
        userLearningSetRepository.findByUserIdAndLearningSetId(userId, learningSetId)
                .ifPresent(uls -> {
                    uls.setFlashcardsScore(0);
                    uls.setTestsScore(0);
                    userLearningSetRepository.save(uls);
                });
    }

    public Optional<UserLearningSetDto> getByUserAndMovie(Long userId, Long movieId) {
        return userLearningSetRepository.findByUserIdAndLearningSetMovieId(userId, movieId)
                .map(userLearningSetMapper::toDto);
    }

    public List<MovieProgressDto> getUserProgressSummary(Long userId) {
        return userLearningSetRepository.findAllByUserIdWithLearningSetAndMovie(userId).stream()
                .map(uls -> createProgressDto(userId, uls))
                .toList();
    }

    private MovieProgressDto createProgressDto(Long userId, UserLearningSet uls) {
        var set = uls.getLearningSet();
        var movie = set.getMovie();

        var statuses = statusRepository.findByUserIdAndLearningItemLearningSetId(userId, set.getId());

        long totalWords = countItemsByType(set, LearningItemType.FLASH_CARD);
        long learnedWords = countLearnedItemsByType(statuses,
                LearningItemType.FLASH_CARD);

        int totalSessionAttempts = uls.getFlashcardsAttempts() != null ? uls.getFlashcardsAttempts() : 0;

        LocalDateTime lastAttemptAt = getLastAttemptTime(statuses);

        int flashcardScorePct = calculateFlashcardScorePct(uls, totalWords, learnedWords);

        if (uls.getFlashcardsScore() != null && uls.getFlashcardsScore() > 0) {
            learnedWords = Math.round((double) flashcardScorePct * totalWords / 100.0);
        }

        long totalTests = countItemsByType(set, LearningItemType.TEST);
        long correctTests = countLearnedItemsByType(statuses, LearningItemType.TEST);
        int testScorePct = calculateScorePct(correctTests, totalTests);

        if (movie != null) {
            log.debug("[DEBUG STATS] Movie: {}, Words: {}/{} ({}%), Tests: {}/{} ({}%), Total Sessions: {}",
                    movie.getTitle(), learnedWords, totalWords, flashcardScorePct,
                    correctTests, totalTests, testScorePct, totalSessionAttempts);
        }

        return movieProgressMapper.toProgressDto(uls, totalWords, learnedWords,
                totalSessionAttempts, lastAttemptAt, flashcardScorePct);
    }

    private long countItemsByType(LearningSet set,
                                  LearningItemType type) {
        return set.getLearningItems().stream()
                .filter(item -> item.getType() == type)
                .count();
    }

    private long countLearnedItemsByType(List<UserLearningItemStatus> statuses,
                                         LearningItemType type) {
        return statuses.stream()
                .filter(s -> s.getStatus() == LearningStatus.LEARNED)
                .filter(s -> s.getLearningItem().getType() == type)
                .count();
    }

    private LocalDateTime getLastAttemptTime(List<UserLearningItemStatus> statuses) {
        return statuses.stream()
                .map(UserLearningItemStatus::getLastAttemptAt)
                .filter(Objects::nonNull)
                .max(Comparator.naturalOrder())
                .orElse(null);
    }

    private int calculateFlashcardScorePct(UserLearningSet uls, long totalWords, long learnedWords) {
        if (uls.getFlashcardsScore() != null && uls.getFlashcardsScore() > 0) {
            return uls.getFlashcardsScore();
        }
        return calculateScorePct(learnedWords, totalWords);
    }

    private int calculateScorePct(long correctOrLearned, long total) {
        return total > 0 ? (int) Math.round(((double) correctOrLearned / total) * 100) : 0;
    }
}