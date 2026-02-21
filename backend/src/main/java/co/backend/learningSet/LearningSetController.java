package co.backend.learningSet;

import co.backend.learningItem.LearningItemDto;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/learning-sets")
@AllArgsConstructor
public class LearningSetController {

    private final LearningSetService learningSetService;

    @PostMapping("/generate/{movieId}")
    public LearningSetDto generate(@PathVariable Long movieId) {
        return learningSetService.generateForMovie(movieId);
    }

    @GetMapping("/{id}")
    public LearningSetDto getById(@PathVariable Long id) {
        return learningSetService.getById(id);
    }

    @GetMapping("/movie/{movieId}/latest")
    public Optional<LearningSetDto> getLatestByMovie(@PathVariable Long movieId) {
        return learningSetService.getLatestByMovieId(movieId);
    }

    @GetMapping("/movie/{movieId}/user/{userId}/latest")
    public Optional<LearningSetDto> getLatestByUserAndMovie(
            @PathVariable Long movieId,
            @PathVariable Long userId,
            @RequestParam(required = false) co.backend.user.EnglishLevel level,
            @RequestParam(required = false) String interests) {

        System.out.println("[CONTROLLER] getLatestByUserAndMovie called - movieId: " + movieId + ", userId: " + userId + ", level: " + level + ", interests: " + interests);

        if (level != null && interests != null) {
            System.out.println("[CONTROLLER] Looking for suitable shared set...");
            Optional<LearningSetDto> suitableSet = learningSetService.findSuitableSet(movieId, level, interests);
            if (suitableSet.isPresent()) {
                System.out.println("[CONTROLLER] Found suitable shared set: " + suitableSet.get().getId());
                return suitableSet;
            } else {
                System.out.println("[CONTROLLER] No suitable shared set found");
            }
        }

        if (level != null) {
            System.out.println("[CONTROLLER] Looking for user-specific set with level...");
            Optional<LearningSetDto> userSet = learningSetService.getLatestByUserAndMovieWithLevel(userId, movieId, level);
            if (userSet.isPresent()) {
                System.out.println("[CONTROLLER] Found user-specific set: " + userSet.get().getId());
                return userSet;
            } else {
                System.out.println("[CONTROLLER] No user-specific set found with level");
            }
        }

        System.out.println("[CONTROLLER] Looking for any user set...");
        Optional<LearningSetDto> anyUserSet = learningSetService.getLatestByUserAndMovie(userId, movieId);
        if (anyUserSet.isPresent()) {
            System.out.println("[CONTROLLER] Found any user set: " + anyUserSet.get().getId());
            return anyUserSet;
        } else {
            System.out.println("[CONTROLLER] No user set found at all - will need to generate");
        }

        return learningSetService.getLatestByUserAndMovie(userId, movieId);
    }

    @GetMapping("/movie/{movieId}")
    public LearningSetDto getOrCreateByMovie(@PathVariable Long movieId) {
        return learningSetService.getOrCreateByMovieId(movieId);
    }

    @GetMapping("/{id}/flashcards")
    public List<LearningItemDto> getFlashCards(@PathVariable Long id) {
        return learningSetService.getFlashCardsByLearningSetId(id);
    }

    @GetMapping("/{id}/tests")
    public List<LearningItemDto> getTestItems(@PathVariable Long id) {
        return learningSetService.getTestItemsByLearningSetId(id);
    }

    @PostMapping("/{id}/tests/generate")
    public List<LearningItemDto> generateTests(@PathVariable Long id) {
        return learningSetService.generateTestsForSet(id);
    }

    @PostMapping("/{id}/approve")
    public void approveSet(@PathVariable Long id) {
        learningSetService.approveSet(id);
    }
}