package co.backend.userLearningSet;

import co.backend.userLearningSet.dto.MovieProgressDto;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;

import co.backend.user.UserService;

@RestController
@RequestMapping("/api/user-learning-sets")
@AllArgsConstructor
public class UserLearningSetController {

    private final UserLearningSetService userLearningSetService;
    private final UserService userService;

    @PostMapping("/complete-flashcards")
    public UserLearningSetDto completeFlashcards(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestParam Long learningSetId,
            @RequestParam int score) {
        Long userId = userService.getCurrentUser(oauth2User).getId();
        return userLearningSetService.completeFlashcards(userId, learningSetId, score);
    }

    @PostMapping("/complete-tests")
    public UserLearningSetDto completeTests(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestParam Long learningSetId,
            @RequestParam int score) {
        Long userId = userService.getCurrentUser(oauth2User).getId();
        return userLearningSetService.completeTests(userId, learningSetId, score);
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<UserLearningSetDto> getByUserAndMovie(
            @PathVariable Long movieId,
            @AuthenticationPrincipal OAuth2User oauth2User) {
        Long userId = userService.getCurrentUser(oauth2User).getId();
        return userLearningSetService.getByUserAndMovie(userId, movieId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/progress")
    public List<MovieProgressDto> getProgress(@AuthenticationPrincipal OAuth2User oauth2User) {
        Long userId = userService.getCurrentUser(oauth2User).getId();
        return userLearningSetService.getUserProgressSummary(userId);
    }
}