package co.backend.movie;

import co.backend.genre.GenreMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {GenreMapper.class})
public interface MovieMapper {

    @Mapping(target = "genres", source = "genres")
    @Mapping(target = "image", ignore = true)
    MovieDto toDto(Movie movie);

    @Mapping(target = "genres", source = "genres")
    @Mapping(target = "image", ignore = true)
    MovieSummaryDto toSummaryDto(Movie movie);
}
