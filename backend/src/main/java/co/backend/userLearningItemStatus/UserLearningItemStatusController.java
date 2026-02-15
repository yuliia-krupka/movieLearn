package co.backend.userLearningItemStatus;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-learning-status")
@AllArgsConstructor
public class UserLearningItemStatusController {

    private final UserLearningItemStatusService statusService;

    @PostMapping("/answer")
    public ResponseEntity<UserLearningItemStatus> recordAnswer(
            @RequestParam Long userId,
            @RequestParam Long learningItemId,
            @RequestParam boolean correct) {
        return ResponseEntity.ok(statusService.recordAnswer(userId, learningItemId, correct));
    }

    @GetMapping("/set/{learningSetId}/user/{userId}")
    public ResponseEntity<List<UserLearningItemStatus>> getStatusesBySet(
            @PathVariable Long learningSetId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(statusService.getStatusesByLearningSet(userId, learningSetId));
    }
}