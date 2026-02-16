package co.backend.userLearningItemStatus;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserLearningItemStatusMapper {

    @Mapping(source = "learningItem.id", target = "learningItemId")
    UserLearningItemStatusDto toDto(UserLearningItemStatus entity);
}
