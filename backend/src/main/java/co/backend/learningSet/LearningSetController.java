package co.backend.learningSet;

import co.backend.learningItem.LearningItemDto;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-sets")
@AllArgsConstructor
public class LearningSetController {

    private final LearningSetService learningSetService;

    @PostMapping("/generate/{movieId}")
    public ResponseEntity<LearningSetDto> generate(@PathVariable Long movieId) {
        return ResponseEntity.ok(learningSetService.generateForMovie(movieId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningSetDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(learningSetService.getById(id));
    }

    @GetMapping("/movie/{movieId}/latest")
    public ResponseEntity<LearningSetDto> getLatestByMovie(@PathVariable Long movieId) {
        return learningSetService.getLatestByMovieId(movieId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<LearningSetDto> getOrCreateByMovie(@PathVariable Long movieId) {
        return ResponseEntity.ok(learningSetService.getOrCreateByMovieId(movieId));
    }

    @GetMapping("/{id}/flashcards")
    public ResponseEntity<List<LearningItemDto>> getFlashCards(@PathVariable Long id) {
        return ResponseEntity.ok(learningSetService.getFlashCardsByLearningSetId(id));
    }

    @GetMapping("/{id}/tests")
    public ResponseEntity<List<LearningItemDto>> getTestItems(@PathVariable Long id) {
        return ResponseEntity.ok(learningSetService.getTestItemsByLearningSetId(id));
    }
}