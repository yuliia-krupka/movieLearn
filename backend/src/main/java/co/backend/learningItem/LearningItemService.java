package co.backend.learningItem;

import co.backend.ai.OpenAiService;
import co.backend.ai.ScriptParser;
import co.backend.movie.Movie;
import co.backend.exceptions.BadRequestException;
import co.backend.exceptions.NotFoundException;
import co.backend.learningSet.LearningSet;
import co.backend.learningSet.LearningSetRepository;
import co.backend.userLearningItemStatus.UserLearningItemStatusService;
import co.backend.userLearningSet.UserLearningSetService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
@Transactional
public class LearningItemService {
    private final LearningItemRepository learningItemRepository;
    private final LearningSetRepository learningSetRepository;
    private final LearningItemMapper learningItemMapper;
    private final OpenAiService openAiService;
    private final ScriptParser scriptParser;
    private final UserLearningItemStatusService userLearningItemStatusService;
    private final UserLearningSetService userLearningSetService;

    public LearningItemDto update(Long id, LearningItemDto dto) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }

        LearningItem item = learningItemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Learning item not found: " + id));
        item.setText(dto.getText());
        item.setTranslation(dto.getTranslation());
        item.setExampleSentence(dto.getExampleSentence());
        item.setAnswers(dto.getAnswers());
        item.setType(dto.getType());
        return learningItemMapper.toDto(learningItemRepository.save(item));
    }

    public LearningItemDto create(LearningItemDto dto) {
        LearningSet learningSet = learningSetRepository.findById(dto.getLearningSetId())
                .orElseThrow(() -> new NotFoundException("Learning set not found: " + dto.getLearningSetId()));

        long flashCardCount = learningSet.getLearningItems().stream()
                .filter(item -> item.getType() == LearningItemType.FLASH_CARD)
                .count();

        if (flashCardCount >= 20) {
            throw new BadRequestException("Maximum limit of 20 flashcards per set reached");
        }

        LearningItem item = learningItemMapper.toEntity(dto);
        item.setLearningSet(learningSet);

        return learningItemMapper.toDto(learningItemRepository.save(item));
    }

    public List<LearningItemDto> regenerate(Long learningSetId, String feedback, List<Long> itemIds) {
        if (itemIds == null || itemIds.isEmpty())
            return List.of();

        LearningSet learningSet = findSetById(learningSetId);
        List<LearningItem> oldItems = learningItemRepository.findAllById(itemIds);
        if (oldItems.isEmpty())
            return List.of();

        List<LearningItemDto> regeneratedDtos = getRegeneratedDtos(learningSet, oldItems, feedback);

        long currentFlashCards = learningSet.getLearningItems().stream()
                .filter(item -> item.getType() == LearningItemType.FLASH_CARD)
                .count();

        long remainingCapacity = 20 - (currentFlashCards - oldItems.size());
        if (regeneratedDtos.size() > remainingCapacity) {
            throw new BadRequestException("Cannot add more flashcards. Maximum limit of 20 per set would be exceeded.");
        }
        learningSet.getLearningItems().removeAll(oldItems);

        List<LearningItem> newItems = regeneratedDtos.stream().map(dto -> createEntityForSet(dto, learningSet))
                .toList();

        List<LearningItem> savedItems = learningItemRepository.saveAll(newItems);
        learningSet.getLearningItems().addAll(savedItems);
        learningSetRepository.save(learningSet);

        updateUserProgressAfterRegeneration(learningSet, savedItems);

        return savedItems.stream().map(learningItemMapper::toDto).toList();
    }

    private LearningItem createEntityForSet(LearningItemDto dto, LearningSet set) {
        LearningItem item = learningItemMapper.toEntity(dto);
        item.setLearningSet(set);
        if (item.getType() == null) {
            item.setType(LearningItemType.FLASH_CARD);
        }
        return item;
    }

    private List<LearningItemDto> getRegeneratedDtos(LearningSet set, List<LearningItem> oldItems, String feedback) {
        List<LearningItemDto> dtos = oldItems.stream().map(learningItemMapper::toDto).toList();
        Movie movie = set.getMovie();

        return openAiService.regenerateBatch(dtos, feedback, movie != null ? movie.getTitle() : "Unknown",
                movie != null ? movie.getDescription() : "", movie != null ? scriptParser.parse(movie.getScript()) : "",
                set.getEnglishLevel() != null ? set.getEnglishLevel().name() : "B1",
                set.getInterests() != null ? set.getInterests() : "");
    }

    private void updateUserProgressAfterRegeneration(LearningSet set, List<LearningItem> newItems) {
        Long creatorId = set.getCreatorId();
        if (creatorId != null) {
            newItems.forEach(item -> userLearningItemStatusService.createStatusIfStarted(creatorId, item));
            userLearningSetService.resetScoresIfIncomplete(creatorId, set.getId());
        }
    }

    private LearningSet findSetById(Long id) {
        return learningSetRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Learning set not found: " + id));
    }

    public void deleteById(Long id) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }
        if (!learningItemRepository.existsById(id)) {
            throw new NotFoundException("Learning item not found: " + id);
        }
        learningItemRepository.deleteById(id);
    }
}