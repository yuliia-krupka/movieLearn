package co.backend.learningSet;

import co.backend.learningItem.LearningItemDto;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class LearningSetService {

    private final LearningSetRepository learningSetRepository;
    private final LearningSetMapper learningSetMapper;
    private final TestDataProvider testDataProvider;

    public LearningSetDto generateForMovie(Long movieId) {
        // Поки не використовуємо AI — беремо тестові дані
        LearningSet set = testDataProvider.createTestLearningSet(movieId);
        LearningSet saved = learningSetRepository.save(set);
        return learningSetMapper.toDto(saved);
    }

    public Optional<LearningSetDto> getLatestByMovieId(Long movieId) {
        return learningSetRepository.findTopByMovieIdOrderByDateDesc(movieId)
                .map(learningSetMapper::toDto);
    }

    public LearningSetDto getById(Long id) {
        LearningSet set = learningSetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning set not found: " + id));
        return learningSetMapper.toDto(set);
    }
}