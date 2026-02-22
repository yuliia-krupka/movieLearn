package co.backend.movie;

import co.backend.genre.Genre;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public abstract class MovieMapper {

    @Mapping(target = "genres", expression = "java(mapGenresToNames(movie.getGenres()))")
    public abstract MovieDto toDto(Movie movie);

    protected List<String> mapGenresToNames(List<Genre> genres) {
        if (genres == null) {
            return Collections.emptyList();
        }
        return genres.stream()
                .map(Genre::getName)
                .collect(Collectors.toList());
    }
}
