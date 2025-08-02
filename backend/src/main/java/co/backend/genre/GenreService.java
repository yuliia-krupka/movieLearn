package co.backend.genre;

import co.backend.exceptions.DuplicateEntityException;
import co.backend.exceptions.NotFoundException;
import co.backend.exceptions.BadRequestException;
import co.backend.movie.Movie;
import co.backend.movie.MovieRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
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
        Genre existingGenre = genreRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Genre with id " + id + " not found"));

        if (genreRepository.existsByName(genreDTO.getName())) {
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

    public void deleteGenre(Long id) {
        if (!genreRepository.existsById(id)) {
            throw new NotFoundException("Genre with id " + id + " not found");
        }

        List<Movie> moviesGenreUsedIn = movieRepository.findAllByGenres_Id(id);

        if (moviesGenreUsedIn != null && !moviesGenreUsedIn.isEmpty()) {
            throw new BadRequestException("Cannot delete genre. It is currently used by one or more movies.");
        }

        genreRepository.deleteById(id);
    }


    public GenreDto getGenreById(Long id) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Genre with id " + id + " not found"));
        return genreMapper.toDTO(genre);
    }

}
