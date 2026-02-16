package co.backend.userLearningSet;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-learning-sets")
@AllArgsConstructor
public class UserLearningSetController {

    private final UserLearningSetService userLearningSetService;
    private final UserLearningSetMapper userLearningSetMapper;

    @PostMapping("/start")
    public ResponseEntity<UserLearningSetDto> start(
            @RequestParam Long userId,
            @RequestParam Long learningSetId) {
        return ResponseEntity
                .ok(userLearningSetMapper.toDto(userLearningSetService.getOrCreate(userId, learningSetId)));
    }

    @PostMapping("/complete-flashcards")
    public ResponseEntity<UserLearningSetDto> completeFlashcards(
            @RequestParam Long userId,
            @RequestParam Long learningSetId,
            @RequestParam int score) {
        return ResponseEntity.ok(
                userLearningSetMapper.toDto(userLearningSetService.completeFlashcards(userId, learningSetId, score)));
    }

    @PostMapping("/complete-tests")
    public ResponseEntity<UserLearningSetDto> completeTests(
            @RequestParam Long userId,
            @RequestParam Long learningSetId,
            @RequestParam int score) {
        return ResponseEntity
                .ok(userLearningSetMapper.toDto(userLearningSetService.completeTests(userId, learningSetId, score)));
    }

    @GetMapping("/movie/{movieId}/user/{userId}")
    public ResponseEntity<UserLearningSetDto> getByUserAndMovie(
            @PathVariable Long movieId,
            @PathVariable Long userId) {
        return userLearningSetService.getByUserAndMovie(userId, movieId)
                .map(uls -> ResponseEntity.ok(userLearningSetMapper.toDto(uls)))
                .orElse(ResponseEntity.notFound().build());
    }
}