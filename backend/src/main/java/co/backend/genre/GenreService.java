package co.backend.genre;

import co.backend.exceptions.DuplicateEntityException;
import co.backend.exceptions.NotFoundException;
import co.backend.exceptions.BadRequestException;
import co.backend.movie.Movie;
import co.backend.movie.MovieRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class GenreService {
    private final GenreRepository genreRepository;
    private final GenreMapper genreMapper;
    private final MovieRepository movieRepository;

    public GenreDto createGenre(GenreDto genreDTO) {
        if (genreRepository.existsByName(genreDTO.getName())) {
            throw new DuplicateEntityException("Genre with name '" + genreDTO.getName() + "' already exists");
        }

        Genre genre = genreMapper.toEntity(genreDTO);
        return genreMapper.toDTO(genreRepository.save(genre));
    }

    public GenreDto updateGenre(Long id, GenreDto genreDTO) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }
        if (genreDTO.getName() == null || genreDTO.getName().trim().isEmpty()) {
            throw new BadRequestException("Genre name must be provided");
        }
        Genre existingGenre = genreRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Genre with id " + id + " not found"));

        if (!existingGenre.getName().equalsIgnoreCase(genreDTO.getName()) &&
                genreRepository.existsByName(genreDTO.getName())) {
            throw new DuplicateEntityException("Genre with name '" + genreDTO.getName() + "' already exists");
        }

        existingGenre.setName(genreDTO.getName());
        return genreMapper.toDTO(genreRepository.save(existingGenre));
    }

    public List<GenreDto> getAllGenres() {
        return genreRepository.findAll().stream()
                .map(genreMapper::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteGenre(Long id, Long excludeMovieId) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Genre with id " + id + " not found"));

        List<Movie> moviesGenreUsedIn = movieRepository.findAllByGenres_Id(id);

        if (moviesGenreUsedIn != null && !moviesGenreUsedIn.isEmpty()) {
            boolean usedByOthers = moviesGenreUsedIn.stream()
                    .anyMatch(m -> excludeMovieId == null || !m.getId().equals(excludeMovieId));

            if (usedByOthers) {
                throw new BadRequestException("Cannot delete genre. It is currently used by other movies.");
            }

            for (Movie movie : moviesGenreUsedIn) {
                movie.getGenres().remove(genre);
                movieRepository.save(movie);
            }
        }

        genreRepository.delete(genre);
    }

    public GenreDto getGenreById(Long id) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Genre with id " + id + " not found"));
        return genreMapper.toDTO(genre);
    }

}
