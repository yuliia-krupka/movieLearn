package co.backend.learningItem;

import lombok.AllArgsConstructor;
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

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        learningItemService.deleteById(id);
    }
}