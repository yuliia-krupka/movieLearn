package co.backend.movie;

import co.backend.exceptions.*;
import co.backend.genre.Genre;
import co.backend.genre.GenreRepository;
import co.backend.user.User;
import co.backend.user.UserRepository;
import co.backend.userLearningSet.UserLearningSetRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
@Transactional
public class MovieService {
    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final UserRepository userRepository;
    private final MovieMapper movieMapper;
    private final UserLearningSetRepository userLearningSetRepository;

    public List<MovieSummaryDto> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(movieMapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    public MovieDto getMovieById(Long id) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie with id " + id + " not found"));
        return movieMapper.toDto(movie);
    }

    public void deleteMovie(Long id) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie with id " + id + " not found"));

        if (movieRepository.hasAnyLearningSets(id)) {
            throw new DeleteException("Movie has associated learning sets. Can not be deleted!");
        }

        for (User user : movie.getUsers()) {
            user.getMovies().remove(movie);
            userRepository.save(user);
        }

        movieRepository.delete(movie);
    }

    public MovieDto createMovie(MovieDto movieDto, MultipartFile script) {

        if (movieDto.getTitle() == null || movieDto.getTitle().isBlank()) {
            throw new DuplicateEntityException("Movie title cannot be empty");
        }
        if (movieDto.getTmdbId() != null && movieRepository.existsByTmdbId(movieDto.getTmdbId())) {
            throw new DuplicateEntityException("Movie with tmdbId '" + movieDto.getTmdbId() + "' already exists");
        }
        if (movieRepository.existsByTitle(movieDto.getTitle())) {
            throw new DuplicateEntityException("Movie with title '" + movieDto.getTitle() + "' already exists");
        }

        Movie movie = new Movie();
        movie.setTitle(movieDto.getTitle());
        movie.setTmdbId(movieDto.getTmdbId());

        List<Genre> genreList = new ArrayList<>();
        if (movieDto.getGenres() != null) {
            for (String genreName : movieDto.getGenres()) {
                Genre genre = genreRepository.findByName(genreName.trim());
                if (genre != null) {
                    genreList.add(genre);
                } else {
                    throw new NotFoundException("Genre with name '" + genreName + "' not found");
                }
            }
        }
        movie.setGenres(genreList);

        setMovieFiles(movie, script);

        movie = movieRepository.save(movie);
        return movieMapper.toDto(movie);
    }

    private void setMovieFiles(Movie movie, MultipartFile script) {
        try {
            if (script != null) {
                if (!script.isEmpty()) {
                    movie.setScript(script.getBytes());
                } else {
                    movie.setScript(null);
                }
            }
        } catch (IOException e) {
            throw new FileUploadException("Failed to upload files", e);
        }
    }

    public MovieDto updateMovie(Long id, MovieDto movieDto, MultipartFile script) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie not found with id: " + id));

        if (movieDto != null) {
            if (movieDto.getTitle() != null &&
                    !movieDto.getTitle().isBlank() &&
                    !movieDto.getTitle().equals(movie.getTitle()) &&
                    movieRepository.existsByTitle(movieDto.getTitle())) {
                throw new DuplicateEntityException("Movie with name '" + movieDto.getTitle() + "' already exists");
            }

            if (movieDto.getTitle() != null && !movieDto.getTitle().isBlank()) {
                movie.setTitle(movieDto.getTitle());
            }

            if (movieDto.getTmdbId() != null) {
                movie.setTmdbId(movieDto.getTmdbId());
            }

            if (movieDto.getGenres() != null) {
                List<Genre> genreList = movieDto.getGenres().stream()
                        .map(String::trim)
                        .map(genreRepository::findByName)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
                movie.setGenres(genreList);
            }
        }

        setMovieFiles(movie, script);

        movie = movieRepository.save(movie);
        return movieMapper.toDto(movie);
    }

    public List<MovieSummaryDto> getMoviesByGenres(List<String> genreNames) {
        List<Genre> genres = genreRepository.findAllByNameIn(genreNames);
        if (genres.isEmpty()) {
            throw new NotFoundException("Genres not found");
        }

        List<Movie> movies = movieRepository.findByGenresIn(genres);

        return movies.stream()
                .map(movieMapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    public List<MovieSummaryDto> getMoviesByTitle(String title) {
        List<Movie> movies = movieRepository.findByTitleContainingIgnoreCase(title);
        return movies.stream()
                .map(movieMapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    public List<MovieSummaryDto> getMoviesByUser(Long userId) {
        return userLearningSetRepository.findAllByUserIdWithLearningSetAndMovie(userId).stream()
                .map(uls -> uls.getLearningSet().getMovie())
                .filter(Objects::nonNull)
                .distinct()
                .map(movieMapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    public int getMoviesCountByUserId(Long userId) {
        return (int) userLearningSetRepository.findAllByUserIdWithLearningSetAndMovie(userId).stream()
                .map(uls -> uls.getLearningSet().getMovie())
                .filter(Objects::nonNull)
                .distinct()
                .count();
    }

}
