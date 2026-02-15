package co.backend.learningSet;

import co.backend.learningItem.LearningItemMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {LearningItemMapper.class})
public interface LearningSetMapper {

    @Mapping(source = "movie.id", target = "movieId")
    LearningSetDto toDto(LearningSet learningSet);

    @Mapping(source = "movieId", target = "movie.id")
    LearningSet toEntity(LearningSetDto dto);
}