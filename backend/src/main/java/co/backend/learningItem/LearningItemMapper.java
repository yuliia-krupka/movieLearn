package co.backend.learningItem;

import co.backend.ai.dto.GeneratedItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LearningItemMapper {

    @Mapping(source = "learningSet.id", target = "learningSetId")
    @Mapping(source = "type", target = "type")
    LearningItemDto toDto(LearningItem learningItem);

    @Mapping(source = "learningSetId", target = "learningSet.id")
    LearningItem toEntity(LearningItemDto dto);

    default LearningItemDto fromGenerated(GeneratedItem item, LearningItemType type) {
        LearningItemDto dto = new LearningItemDto();
        dto.setText(item.getText());
        dto.setTranslation(item.getTranslation());
        dto.setTranscription(item.getTranscription());
        dto.setExampleSentence(item.getExampleSentence());

        if (type != null) {
            dto.setType(type);
        } else if (item.getAnswers() != null && !item.getAnswers().isEmpty()) {
            dto.setType(LearningItemType.TEST);
        } else {
            dto.setType(LearningItemType.FLASH_CARD);
        }

        if (dto.getType() == LearningItemType.TEST) {
            if (item.getAnswers() != null && !item.getAnswers().isEmpty()) {
                dto.setAnswers(item.getAnswers());
            }
            dto.setCorrectAnswerIndex(item.getCorrectAnswerIndex());
        }

        return dto;
    }
}
