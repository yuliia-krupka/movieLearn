package co.backend.learningItem;

import co.backend.exceptions.BadRequestException;
import co.backend.exceptions.NotFoundException;
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