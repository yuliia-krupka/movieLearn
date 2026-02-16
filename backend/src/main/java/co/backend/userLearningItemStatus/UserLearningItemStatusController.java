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
    private final UserLearningItemStatusMapper statusMapper;

    @PostMapping("/answer")
    public ResponseEntity<UserLearningItemStatusDto> recordAnswer(
            @RequestParam Long userId,
            @RequestParam Long learningItemId,
            @RequestParam boolean correct) {
        UserLearningItemStatus entity = statusService.recordAnswer(userId, learningItemId, correct);
        return ResponseEntity.ok(statusMapper.toDto(entity));
    }

    @GetMapping("/set/{learningSetId}/user/{userId}")
    public ResponseEntity<List<UserLearningItemStatusDto>> getStatusesBySet(
            @PathVariable Long learningSetId,
            @PathVariable Long userId) {
        List<UserLearningItemStatusDto> dtos = statusService.getStatusesByLearningSet(userId, learningSetId)
                .stream()
                .map(statusMapper::toDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }
}