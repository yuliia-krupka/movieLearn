package co.backend.learningItem;

import co.backend.ai.dto.RegenerateRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-items")
@AllArgsConstructor
public class LearningItemController {

    private final LearningItemService learningItemService;

    @PutMapping("/{id}")
    public LearningItemDto update(@PathVariable Long id, @RequestBody LearningItemDto dto) {
        return learningItemService.update(id, dto);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LearningItemDto create(@RequestBody LearningItemDto dto) {
        return learningItemService.create(dto);
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
}