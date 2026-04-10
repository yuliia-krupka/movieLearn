package co.backend.learningSet;

import co.backend.learningItem.LearningItemDto;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;

import co.backend.user.UserService;

@RestController
@RequestMapping("/api/learning-sets")
@AllArgsConstructor
@Slf4j
public class LearningSetController {

    private final LearningSetService learningSetService;
    private final UserService userService;

    @GetMapping("/{id}")
    public LearningSetDto getById(@PathVariable Long id, @AuthenticationPrincipal OAuth2User oauth2User) {
        Long userId = userService.getCurrentUser(oauth2User).getId();
        return learningSetService.getById(id, userId);
    }


    @GetMapping("/{id}/flashcards")
    public List<LearningItemDto> getFlashCards(@PathVariable Long id, @AuthenticationPrincipal OAuth2User oauth2User) {
        Long userId = userService.getCurrentUser(oauth2User).getId();
        return learningSetService.getFlashCardsByLearningSetId(id, userId);
    }

    @GetMapping("/{id}/tests")
    public List<LearningItemDto> getTestItems(@PathVariable Long id, @AuthenticationPrincipal OAuth2User oauth2User) {
        Long userId = userService.getCurrentUser(oauth2User).getId();
        return learningSetService.getTestItemsByLearningSetId(id, userId);
    }

    @PostMapping("/movie/{movieId}/start")
    public LearningSetDto startLearning(
            @PathVariable Long movieId,
            @AuthenticationPrincipal OAuth2User oauth2User) {
        Long userId = userService.getCurrentUser(oauth2User).getId();
        log.info("[BACKEND] startLearning called - movieId: {}, userId: {}", movieId, userId);
        return learningSetService.generateForUser(movieId, userId);
    }

    @PostMapping("/{setId}/approve")
    public void approveSet(@PathVariable Long setId, @AuthenticationPrincipal OAuth2User oauth2User) {
        Long userId = userService.getCurrentUser(oauth2User).getId();
        learningSetService.updateStatus(setId, LearningSetStatus.READY, userId);
    }

    @GetMapping("/movie/{movieId}/latest")
    public Optional<LearningSetDto> getLatestByUserAndMovie(
            @PathVariable Long movieId,
            @AuthenticationPrincipal OAuth2User oauth2User) {
        Long userId = userService.getCurrentUser(oauth2User).getId();

        log.info("getLatestByUserAndMovie called - movieId: {}, userId: {}", movieId, userId);

        Optional<LearningSetDto> userSet = learningSetService.getLatestByUserAndMovie(userId, movieId);
        if (userSet.isPresent()) {
            log.info("Found user set: {}", userSet.get().getId());
            return userSet;
        } else {
            log.info("No user set found for userId: {}, movieId: {} - will need to generate", userId, movieId);
            return Optional.empty();
        }
    }
}