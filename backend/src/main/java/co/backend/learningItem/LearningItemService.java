package co.backend.learningItem;

import co.backend.ai.OpenAiService;
import co.backend.exceptions.BadRequestException;
import co.backend.exceptions.NotFoundException;
import co.backend.learningSet.LearningSet;
import co.backend.learningSet.LearningSetRepository;
import co.backend.movie.Movie;
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

    public List<LearningItemDto> getByLearningSetId(Long learningSetId) {
        return learningItemRepository.findByLearningSetId(learningSetId)
                .stream()
                .map(learningItemMapper::toDto)
                .toList();
    }

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

    public List<LearningItemDto> updateBatch(List<LearningItemDto> items) {
        return items.stream()
                .map(dto -> update(dto.getId(), dto))
                .toList();
    }

    public LearningItemDto create(LearningItemDto dto) {
        LearningSet learningSet = learningSetRepository.findById(dto.getLearningSetId())
                .orElseThrow(() -> new NotFoundException("Learning set not found: " + dto.getLearningSetId()));

        LearningItem item = learningItemMapper.toEntity(dto);
        item.setLearningSet(learningSet);

        return learningItemMapper.toDto(learningItemRepository.save(item));
    }

    public List<LearningItemDto> generateCustom(String request, Long learningSetId) {
        LearningSet learningSet = learningSetRepository.findById(learningSetId)
                .orElseThrow(() -> new NotFoundException("Learning set not found: " + learningSetId));

        Movie movie = learningSet.getMovie();

        List<LearningItemDto> generatedDtos = openAiService.generateCustom(
                request,
                movie != null ? movie.getTitle() : "Unknown",
                movie != null ? movie.getDescription() : "");

        List<LearningItem> itemsToSave = generatedDtos.stream().map(dto -> {
            LearningItem item = learningItemMapper.toEntity(dto);
            item.setLearningSet(learningSet);
            return item;
        }).toList();

        List<LearningItem> savedItems = learningItemRepository.saveAll(itemsToSave);

        return savedItems.stream()
                .map(learningItemMapper::toDto)
                .toList();
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
        String movieTitle = movie != null ? movie.getTitle() : "Unknown";
        String movieDescription = movie != null ? movie.getDescription() : "";
        String scriptContent = movie != null ? openAiService.parseScript(movie.getScript()) : "";
        String englishLevel = learningSet.getEnglishLevel() != null ? learningSet.getEnglishLevel().name()
                : "Intermediate";
        String interests = learningSet.getInterests() != null ? learningSet.getInterests() : "";

        List<LearningItemDto> regeneratedDtos = openAiService.regenerateBatch(dtos, feedback, movieTitle,
                movieDescription, scriptContent, englishLevel, interests);
        learningSet.getLearningItems().removeAll(items);

        List<LearningItem> newItems = regeneratedDtos.stream().map(dto -> {
            LearningItem item = learningItemMapper.toEntity(dto);
            item.setLearningSet(learningSet);
            if (item.getType() == null) {
                item.setType(co.backend.learningItem.LearningItemType.FLASH_CARD);
            }
            return item;
        }).toList();

        learningSet.getLearningItems().addAll(newItems);
        learningSetRepository.save(learningSet);

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