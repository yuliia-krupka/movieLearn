package co.backend.learningItem;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LearningItemMapper {

    @Mapping(source = "learningSet.id", target = "learningSetId")
    @Mapping(source = "type", target = "type")
    LearningItemDto toDto(LearningItem learningItem);

    @Mapping(source = "learningSetId", target = "learningSet.id")
    LearningItem toEntity(LearningItemDto dto);
}
