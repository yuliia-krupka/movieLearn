package co.backend.learningItem;

import co.backend.exceptions.BadRequestException;
import co.backend.exceptions.NotFoundException;
import co.backend.learningSet.LearningSet;
import co.backend.learningSet.LearningSetRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;

@Service
@AllArgsConstructor
public class LearningItemService {
    private final LearningItemRepository learningItemRepository;
    private final LearningSetRepository learningSetRepository;
    private final LearningItemMapper learningItemMapper;

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

        LearningItem item1 = new LearningItem();
        item1.setText("Mock Word 1 for " + request);
        item1.setTranslation("Mock Translation 1");
        item1.setExampleSentence("This is a mock sentence for word 1.");
        item1.setTranscription("[mɒk wɜːd wʌn]");
        item1.setType(LearningItemType.FLASH_CARD);
        item1.setLearningSet(learningSet);

        LearningItem item2 = new LearningItem();
        item2.setText("Mock Word 2 for " + request);
        item2.setTranslation("Mock Translation 2");
        item2.setExampleSentence("This is a mock sentence for word 2.");
        item2.setTranscription("[mɒk wɜːd tuː]");
        item2.setType(LearningItemType.FLASH_CARD);
        item2.setLearningSet(learningSet);

        List<LearningItem> savedItems = learningItemRepository.saveAll(List.of(item1, item2));

        return savedItems.stream()
                .map(learningItemMapper::toDto)
                .toList();
    }

    public List<LearningItemDto> regenerate(Long learningSetId, String feedback, List<Long> itemIds) {
        // Mock implementation:
        // 1. Delete the items that are being regenerated
        if (itemIds != null && !itemIds.isEmpty()) {
            learningItemRepository.deleteAllById(itemIds);
        }

        // 2. Generate new items based on feedback (Mock)
        LearningSet learningSet = learningSetRepository.findById(learningSetId)
                .orElseThrow(() -> new NotFoundException("Learning set not found: " + learningSetId));

        List<LearningItem> newItems = new ArrayList<>();
        for (int i = 0; i < (itemIds != null ? itemIds.size() : 2); i++) {
            LearningItem item = new LearningItem();
            item.setText("Regenerated Word " + (i + 1) + " (" + feedback + ")");
            item.setTranslation("Regenerated Translation " + (i + 1));
            item.setExampleSentence("New example sentence for word " + (i + 1));
            item.setTranscription("[rɪˈdʒɛn.ə.reɪ.tɪd wɜːd]");
            item.setType(LearningItemType.FLASH_CARD);
            item.setLearningSet(learningSet);
            newItems.add(item);
        }

        List<LearningItem> savedItems = learningItemRepository.saveAll(newItems);
        return savedItems.stream()
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