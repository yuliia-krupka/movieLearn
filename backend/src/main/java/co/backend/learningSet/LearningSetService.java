package co.backend.learningSet;

import co.backend.exceptions.BadRequestException;
import co.backend.exceptions.NotFoundException;
import co.backend.learningItem.LearningItemDto;
import co.backend.learningItem.LearningItemMapper;
import co.backend.learningItem.LearningItemType;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Transactional
public class LearningSetService {

    private final LearningSetRepository learningSetRepository;
    private final LearningSetMapper learningSetMapper;
    private final LearningItemMapper learningItemMapper;
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

    public LearningSetDto getOrCreateByMovieId(Long movieId) {
        LearningSetDto potentialSet = getLatestByMovieId(movieId).orElse(null);

        if (potentialSet == null) {
            return generateForMovie(movieId);
        }

        // If the set exists but is empty (e.g. all items deleted), regenerate it.
        // This ensures the user always has a valid set to start with from Movie
        // Details.
        if (potentialSet.getLearningItems() == null || potentialSet.getLearningItems().isEmpty()) {
            try {
                // Try to clean up the empty set to avoid clutter
                learningSetRepository.deleteById(potentialSet.getId());
            } catch (Exception e) {
                // If deletion fails (e.g. FK constraints from user progress),
                // we ignore it and just create a fresh set which will become the latest.
                System.out.println("Could not delete empty set " + potentialSet.getId() + ": " + e.getMessage());
            }
            return generateForMovie(movieId);
        }

        return potentialSet;
    }

    public LearningSetDto getById(Long id) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }
        LearningSet set = learningSetRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Learning set not found: " + id));
        return learningSetMapper.toDto(set);
    }

    public List<LearningItemDto> getFlashCardsByLearningSetId(Long learningSetId) {
        if (learningSetId == null) {
            throw new BadRequestException("Id must be provided");
        }
        LearningSet set = learningSetRepository.findById(learningSetId)
                .orElseThrow(() -> new NotFoundException("Learning set not found: " + learningSetId));
        return set.getLearningItems().stream()
                .filter(item -> item.getType() == LearningItemType.FLASH_CARD)
                .map(learningItemMapper::toDto)
                .toList();
    }

    public List<LearningItemDto> getTestItemsByLearningSetId(Long learningSetId) {
        if (learningSetId == null) {
            throw new BadRequestException("Id must be provided");
        }
        LearningSet set = learningSetRepository.findById(learningSetId)
                .orElseThrow(() -> new NotFoundException("Learning set not found: " + learningSetId));
        return set.getLearningItems().stream()
                .filter(item -> item.getType() == LearningItemType.TEST)
                .map(learningItemMapper::toDto)
                .toList();
    }
}