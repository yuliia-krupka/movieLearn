package co.backend.userLearningItemStatus;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;

import co.backend.user.UserService;

@RestController
@RequestMapping("/api/user-learning-status")
@AllArgsConstructor
public class UserLearningItemStatusController {

    private final UserLearningItemStatusService statusService;
    private final UserService userService;

    @PostMapping("/answer")
    public UserLearningItemStatusDto recordAnswer(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestParam Long learningItemId,
            @RequestParam boolean correct) {
        Long userId = userService.getCurrentUser(oauth2User).getId();
        return statusService.recordAnswer(userId, learningItemId, correct);
    }

    @PostMapping("/answers/bulk")
    public List<UserLearningItemStatusDto> recordAnswersBulk(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestBody List<co.backend.userLearningItemStatus.dto.AnswerDto> answers) {
        Long userId = userService.getCurrentUser(oauth2User).getId();
        return statusService.recordAnswersBulk(userId, answers);
    }

    @GetMapping("/set/{learningSetId}")
    public List<UserLearningItemStatusDto> getStatusesBySet(
            @PathVariable Long learningSetId,
            @AuthenticationPrincipal OAuth2User oauth2User) {
        Long userId = userService.getCurrentUser(oauth2User).getId();
        return statusService.getStatusesByLearningSet(userId, learningSetId);
    }
}