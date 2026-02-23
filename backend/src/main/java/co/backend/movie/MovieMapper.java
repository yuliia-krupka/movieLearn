package co.backend.movie;

import co.backend.genre.GenreMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {GenreMapper.class})
public interface MovieMapper {

    @Mapping(target = "genres", source = "genres")
    MovieDto toDto(Movie movie);
}
