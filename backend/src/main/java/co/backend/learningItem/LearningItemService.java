package co.backend.learningItem;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class LearningItemService {
    private final LearningItemRepository learningItemRepository;
    private final LearningItemMapper learningItemMapper;

    public List<LearningItemDto> getByLearningSetId(Long learningSetId) {
        return learningItemRepository.findByLearningSetId(learningSetId)
                .stream()
                .map(learningItemMapper::toDto)
                .toList();
    }

    public LearningItemDto update(Long id, LearningItemDto dto) {
        LearningItem item = learningItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning item not found: " + id));
        item.setText(dto.getText());
        item.setTranslation(dto.getTranslation());
        item.setExampleSentence(dto.getExampleSentence());
        item.setAnswers(dto.getAnswers());
        item.setType(dto.getType());
        return learningItemMapper.toDto(learningItemRepository.save(item));
    }

    public List<LearningItemDto> updateBatch(List<LearningItemDto> dtos) {
        return dtos.stream()
                .map(dto -> update(dto.getId(), dto))
                .toList();
    }

    public void deleteById(Long id) {
        learningItemRepository.deleteById(id);
    }
}