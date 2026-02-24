package co.backend.learningSet;

import co.backend.learningItem.LearningItemDto;
import co.backend.user.EnglishLevel;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/learning-sets")
@AllArgsConstructor
@Slf4j
public class LearningSetController {

    private final LearningSetService learningSetService;

    @GetMapping("/{id}")
    public LearningSetDto getById(@PathVariable Long id) {
        return learningSetService.getById(id);
    }

    @GetMapping("/movie/{movieId}")
    public LearningSetDto getOrCreateByMovie(@PathVariable Long movieId) {
        return learningSetService.getOrCreateByMovieId(movieId);
    }

    @GetMapping("/{id}/flashcards")
    public List<LearningItemDto> getFlashCards(@PathVariable Long id, @RequestParam Long userId) {
        return learningSetService.getFlashCardsByLearningSetId(id, userId);
    }

    @GetMapping("/{id}/tests")
    public List<LearningItemDto> getTestItems(@PathVariable Long id, @RequestParam Long userId) {
        return learningSetService.getTestItemsByLearningSetId(id, userId);
    }

    @PostMapping("/movie/{movieId}/start")
    public LearningSetDto startLearning(
            @PathVariable Long movieId,
            @RequestParam Long userId) {
        log.info("[BACKEND] startLearning called - movieId: {}, userId: {}", movieId, userId);
        return learningSetService.generateForUser(movieId, userId);
    }

    @PostMapping("/{setId}/approve")
    public void approveSet(@PathVariable Long setId) {
        learningSetService.updateStatus(setId, LearningSetStatus.READY);
    }

    @GetMapping("/movie/{movieId}/user/{userId}/latest")
    public Optional<LearningSetDto> getLatestByUserAndMovie(
            @PathVariable Long movieId,
            @PathVariable Long userId,
            @RequestParam(required = false) EnglishLevel level,
            @RequestParam(required = false) String interests) {

        log.info("getLatestByUserAndMovie called - movieId: {}, userId: {}, level: {}, interests: {}",
                movieId, userId, level, interests);

        if (level != null && interests != null) {
            log.info("Looking for suitable shared set for movieId: {} with level {}...", movieId, level);
            Optional<LearningSetDto> suitableSet = learningSetService.findSuitableSet(movieId, level, interests);
            if (suitableSet.isPresent()) {
                log.info("Found suitable shared set: {}", suitableSet.get().getId());
                return suitableSet;
            } else {
                log.info("No suitable shared set found for movieId: {} with level {}", movieId, level);
            }
        }

        if (level != null) {
            log.info("Looking for user-specific set for userId: {}, movieId: {} with level {}...", userId, movieId,
                    level);
            Optional<LearningSetDto> userSet = learningSetService.getLatestByUserAndMovieWithLevel(userId, movieId,
                    level);
            if (userSet.isPresent()) {
                log.info("Found user-specific set: {}", userSet.get().getId());
                return userSet;
            } else {
                log.info("No user-specific set found for userId: {}, movieId: {} with level {}", userId, movieId,
                        level);
            }
        }

        if (level == null) {
            log.info("No level specified, looking for any user set for userId: {}, movieId: {}", userId, movieId);
            Optional<LearningSetDto> anyUserSet = learningSetService.getLatestByUserAndMovie(userId, movieId);
            if (anyUserSet.isPresent()) {
                log.info("Found any user set: {}", anyUserSet.get().getId());
                return anyUserSet;
            } else {
                log.info("No user set found at all for userId: {}, movieId: {} - will need to generate", userId,
                        movieId);
            }
        } else {
            log.info(
                    "Level {} specified but no matching set found for userId: {}, movieId: {} - will need to generate new set",
                    level, userId, movieId);
        }

        return Optional.empty();
    }
}