package co.backend.userLearningSet;

import co.backend.userLearningSet.dto.MovieProgressDto;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-learning-sets")
@AllArgsConstructor
public class UserLearningSetController {

    private final UserLearningSetService userLearningSetService;

    @PostMapping("/start")
    public UserLearningSetDto start(
            @RequestParam Long userId,
            @RequestParam Long learningSetId) {
        return userLearningSetService.getOrCreate(userId, learningSetId);
    }

    @PostMapping("/complete-flashcards")
    public UserLearningSetDto completeFlashcards(
            @RequestParam Long userId,
            @RequestParam Long learningSetId,
            @RequestParam int score) {
        return userLearningSetService.completeFlashcards(userId, learningSetId, score);
    }

    @PostMapping("/complete-tests")
    public UserLearningSetDto completeTests(
            @RequestParam Long userId,
            @RequestParam Long learningSetId,
            @RequestParam int score) {
        return userLearningSetService.completeTests(userId, learningSetId, score);
    }

    @GetMapping("/movie/{movieId}/user/{userId}")
    public ResponseEntity<UserLearningSetDto> getByUserAndMovie(
            @PathVariable Long movieId,
            @PathVariable Long userId) {
        return userLearningSetService.getByUserAndMovie(userId, movieId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}/progress")
    public List<MovieProgressDto> getProgress(@PathVariable Long userId) {
        return userLearningSetService.getUserProgressSummary(userId);
    }
}