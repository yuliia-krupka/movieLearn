package co.backend.genre;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface GenreMapper {
    Genre toEntity(GenreDto genreDTO);

    GenreDto toDTO(Genre genre);

    default String mapGenreToName(Genre genre) {
        if (genre == null) {
            return null;
        }
        return genre.getName();
    }
}