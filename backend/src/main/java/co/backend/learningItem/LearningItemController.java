package co.backend.learningItem;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-items")
@AllArgsConstructor
public class LearningItemController {

    private final LearningItemService learningItemService;

    @GetMapping("/set/{learningSetId}")
    public List<LearningItemDto> getByLearningSet(@PathVariable Long learningSetId) {
        return learningItemService.getByLearningSetId(learningSetId);
    }

    @PutMapping("/{id}")
    public LearningItemDto update(@PathVariable Long id, @RequestBody LearningItemDto dto) {
        return learningItemService.update(id, dto);
    }

    @PutMapping("/batch")
    public List<LearningItemDto> updateBatch(@RequestBody List<LearningItemDto> items) {
        return learningItemService.updateBatch(items);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LearningItemDto create(@RequestBody LearningItemDto dto) {
        return learningItemService.create(dto);
    }

    @PostMapping("/generate-custom")
    public List<LearningItemDto> generateCustom(@RequestParam String request, @RequestParam Long learningSetId) {
        return learningItemService.generateCustom(request, learningSetId);
    }

    @PostMapping("/regenerate")
    public List<LearningItemDto> regenerate(@RequestBody RegenerateRequest request) {
        return learningItemService.regenerate(request.getLearningSetId(), request.getFeedback(), request.getItemIds());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        learningItemService.deleteById(id);
    }

    @Data
    public static class RegenerateRequest {
        private Long learningSetId;
        private String feedback;
        private List<Long> itemIds;
    }
}