package co.backend.userLearningSet;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserLearningSetMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "learningSet.id", target = "learningSetId")
    UserLearningSetDto toDto(UserLearningSet entity);
}
