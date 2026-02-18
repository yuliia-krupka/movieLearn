package co.backend.movie;

import co.backend.genre.Genre;
import co.backend.genre.GenreRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public abstract class MovieMapper {

    @Autowired
    protected GenreRepository genreRepository;

    @Mapping(target = "genres", expression = "java(mapGenresToNames(movie.getGenres()))")
    public abstract MovieDto toDto(Movie movie);

    @Mapping(target = "genres", ignore = true)
    public abstract Movie toEntityWithoutGenres(MovieDto movieDto);

    public Movie toEntity(MovieDto movieDto) {
        Movie movie = toEntityWithoutGenres(movieDto);

        if (movieDto.getGenres() != null) {
            List<Genre> genres = movieDto.getGenres().stream()
                    .map(String::trim)
                    .map(genreRepository::findByName)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            movie.setGenres(genres);
        }

        return movie;
    }

    protected List<String> mapGenresToNames(List<Genre> genres) {
        if (genres == null) {
            return Collections.emptyList();
        }
        return genres.stream()
                .map(Genre::getName)
                .collect(Collectors.toList());
    }
}
