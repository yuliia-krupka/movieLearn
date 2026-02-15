package co.backend.learningItem;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-items")
@AllArgsConstructor
public class LearningItemController {

    private final LearningItemService learningItemService;

    @GetMapping("/set/{learningSetId}")
    public ResponseEntity<List<LearningItemDto>> getByLearningSet(@PathVariable Long learningSetId) {
        return ResponseEntity.ok(learningItemService.getByLearningSetId(learningSetId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningItemDto> update(@PathVariable Long id, @RequestBody LearningItemDto dto) {
        return ResponseEntity.ok(learningItemService.update(id, dto));
    }

    @PutMapping("/batch")
    public ResponseEntity<List<LearningItemDto>> updateBatch(@RequestBody List<LearningItemDto> dtos) {
        return ResponseEntity.ok(learningItemService.updateBatch(dtos));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        learningItemService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}