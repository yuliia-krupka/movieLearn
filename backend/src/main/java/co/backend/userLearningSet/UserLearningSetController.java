package co.backend.userLearningSet;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-learning-sets")
@AllArgsConstructor
public class UserLearningSetController {

    private final UserLearningSetService userLearningSetService;

    @PostMapping("/start")
    public ResponseEntity<UserLearningSet> start(
            @RequestParam Long userId,
            @RequestParam Long learningSetId) {
        return ResponseEntity.ok(userLearningSetService.getOrCreate(userId, learningSetId));
    }

    @PostMapping("/complete-flashcards")
    public ResponseEntity<UserLearningSet> completeFlashcards(
            @RequestParam Long userId,
            @RequestParam Long learningSetId,
            @RequestParam int score) {
        return ResponseEntity.ok(userLearningSetService.completeFlashcards(userId, learningSetId, score));
    }

    @PostMapping("/complete-tests")
    public ResponseEntity<UserLearningSet> completeTests(
            @RequestParam Long userId,
            @RequestParam Long learningSetId,
            @RequestParam int score) {
        return ResponseEntity.ok(userLearningSetService.completeTests(userId, learningSetId, score));
    }

    @GetMapping("/movie/{movieId}/user/{userId}")
    public ResponseEntity<UserLearningSet> getByUserAndMovie(
            @PathVariable Long movieId,
            @PathVariable Long userId) {
        return userLearningSetService.getByUserAndMovie(userId, movieId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}