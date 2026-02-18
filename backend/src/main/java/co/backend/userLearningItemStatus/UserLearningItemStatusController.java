package co.backend.userLearningItemStatus;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-learning-status")
@AllArgsConstructor
public class UserLearningItemStatusController {

    private final UserLearningItemStatusService statusService;

    @PostMapping("/answer")
    public UserLearningItemStatusDto recordAnswer(
            @RequestParam Long userId,
            @RequestParam Long learningItemId,
            @RequestParam boolean correct) {
        return statusService.recordAnswer(userId, learningItemId, correct);
    }

    @GetMapping("/set/{learningSetId}/user/{userId}")
    public List<UserLearningItemStatusDto> getStatusesBySet(
            @PathVariable Long learningSetId,
            @PathVariable Long userId) {
        return statusService.getStatusesByLearningSet(userId, learningSetId);
    }
}