package co.backend.ai;

import co.backend.learningItem.LearningItemDto;
import co.backend.learningSet.LearningSetDto;
import co.backend.learningSet.LearningSetService;
import co.backend.learningSet.LearningSetStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning")
@RequiredArgsConstructor
public class LearningController {

    private final LearningSetService learningSetService;

    @PostMapping("/movie/{movieId}/start")
    public LearningSetDto startLearning(
            @PathVariable Long movieId,
            @RequestParam Long userId) {
        return learningSetService.generateForUser(movieId, userId);
    }

    @PutMapping("/set/{setId}/items")
    public LearningSetDto updateItems(
            @PathVariable Long setId,
            @RequestBody List<LearningItemDto> items) {
        learningSetService.updateItems(setId, items);
        return learningSetService.getById(setId);
    }

    @PostMapping("/set/{setId}/item/{itemId}/regenerate")
    public LearningItemDto regenerateItem(
            @PathVariable Long setId,
            @PathVariable Long itemId,
            @RequestBody String instructions) {
        return learningSetService.regenerateItem(setId, itemId, instructions);
    }

    @PostMapping("/set/{setId}/approve")
    public void approveSet(@PathVariable Long setId) {
        learningSetService.updateStatus(setId, LearningSetStatus.READY);
    }
}
