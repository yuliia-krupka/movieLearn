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

        LearningItem item = learningItemMapper.toEntity(dto);
        item.setLearningSet(learningSet);

        return learningItemMapper.toDto(learningItemRepository.save(item));
    }

    public List<LearningItemDto> regenerate(Long learningSetId, String feedback, List<Long> itemIds) {
        if (itemIds == null || itemIds.isEmpty()) {
            return List.of();
        }

        LearningSet learningSet = learningSetRepository.findById(learningSetId)
                .orElseThrow(() -> new NotFoundException("Learning set not found: " + learningSetId));

        List<LearningItem> items = learningItemRepository.findAllById(itemIds);
        if (items.isEmpty())
            return List.of();

        List<LearningItemDto> dtos = items.stream().map(learningItemMapper::toDto).toList();

        Movie movie = learningSet.getMovie();
        List<LearningItemDto> regeneratedDtos = openAiService.regenerateBatch(
                dtos, feedback,
                movie != null ? movie.getTitle() : "Unknown",
                movie != null ? movie.getDescription() : "",
                movie != null ? scriptParser.parse(movie.getScript()) : "",
                learningSet.getEnglishLevel() != null ? learningSet.getEnglishLevel().name() : "B1",
                learningSet.getInterests() != null ? learningSet.getInterests() : ""
        );
        learningSet.getLearningItems().removeAll(items);

        List<LearningItem> newItems = regeneratedDtos.stream().map(dto -> {
            LearningItem item = learningItemMapper.toEntity(dto);
            item.setLearningSet(learningSet);
            if (item.getType() == null) {
                item.setType(LearningItemType.FLASH_CARD);
            }
            return item;
        }).toList();

        newItems = learningItemRepository.saveAll(newItems);

        learningSet.getLearningItems().addAll(newItems);
        LearningSet savedSet = learningSetRepository.save(learningSet);

        if (savedSet.getCreatorId() != null) {
            for (LearningItem newItem : newItems) {
                userLearningItemStatusService.createStatusIfStarted(savedSet.getCreatorId(), newItem);
            }
            userLearningSetService.resetScoresIfIncomplete(savedSet.getCreatorId(), savedSet.getId());
        }

        return newItems.stream()
                .map(learningItemMapper::toDto)
                .toList();
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