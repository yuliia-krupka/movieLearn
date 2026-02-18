package co.backend.learningSet;

import co.backend.learningItem.LearningItemDto;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/learning-sets")
@AllArgsConstructor
public class LearningSetController {

    private final LearningSetService learningSetService;

    @PostMapping("/generate/{movieId}")
    public LearningSetDto generate(@PathVariable Long movieId) {
        return learningSetService.generateForMovie(movieId);
    }

    @GetMapping("/{id}")
    public LearningSetDto getById(@PathVariable Long id) {
        return learningSetService.getById(id);
    }

    @GetMapping("/movie/{movieId}/latest")
    public Optional<LearningSetDto> getLatestByMovie(@PathVariable Long movieId) {
        return learningSetService.getLatestByMovieId(movieId);
    }

    @GetMapping("/movie/{movieId}")
    public LearningSetDto getOrCreateByMovie(@PathVariable Long movieId) {
        return learningSetService.getOrCreateByMovieId(movieId);
    }

    @GetMapping("/{id}/flashcards")
    public List<LearningItemDto> getFlashCards(@PathVariable Long id) {
        return learningSetService.getFlashCardsByLearningSetId(id);
    }

    @GetMapping("/{id}/tests")
    public List<LearningItemDto> getTestItems(@PathVariable Long id) {
        return learningSetService.getTestItemsByLearningSetId(id);
    }
}