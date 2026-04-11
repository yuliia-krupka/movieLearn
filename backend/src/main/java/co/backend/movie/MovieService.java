package co.backend.movie;

import co.backend.exceptions.BadRequestException;
import co.backend.exceptions.DuplicateEntityException;
import co.backend.exceptions.FileUploadException;
import co.backend.exceptions.ForbiddenException;
import co.backend.exceptions.NotFoundException;
import co.backend.genre.Genre;
import co.backend.genre.GenreRepository;
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
    private final MovieMapper movieMapper;
    private final co.backend.learningSet.LearningSetRepository learningSetRepository;

    public List<MovieSummaryDto> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(movie -> mapToSummaryWithLevel(movie, movie.getCreatorId()))
                .collect(Collectors.toList());
    }

    public MovieDto getMovieById(Long id, Long requestingUserId, boolean isAdmin) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie with id " + id + " not found"));

        if (!isAdmin && !Objects.equals(movie.getCreatorId(), requestingUserId)) {
            throw new ForbiddenException("You do not have permission to view this movie.");
        }

        return movieMapper.toDto(movie);
    }

    public void deleteMovie(Long id, Long requestingUserId, boolean isAdmin) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie with id " + id + " not found"));

        if (!isAdmin && !Objects.equals(movie.getCreatorId(), requestingUserId)) {
            throw new ForbiddenException("You do not have permission to delete this movie.");
        }

        learningSetRepository.deleteByMovieId(id);

        movieRepository.delete(movie);
    }

    public MovieDto createMovie(MovieDto movieDto, MultipartFile script, Long creatorId) {

        if (movieDto.getTitle() == null || movieDto.getTitle().isBlank()) {
            throw new BadRequestException("Movie title cannot be empty");
        }

        if (movieDto.getTmdbId() != null && movieRepository.existsByTmdbIdAndCreatorId(movieDto.getTmdbId(), creatorId)) {
            throw new DuplicateEntityException("You have already added this movie.");
        }

        Movie movie = new Movie();
        movie.setTitle(movieDto.getTitle());
        movie.setTmdbId(movieDto.getTmdbId());
        movie.setCreatorId(creatorId);

        if (movieDto.getImage() != null) {
            movie.setImage(movieDto.getImage());
        }
        if (movieDto.getOverview() != null) {
            movie.setOverview(movieDto.getOverview());
        }

        List<Genre> genreList = new ArrayList<>();
        if (movieDto.getGenres() != null) {
            for (String genreName : movieDto.getGenres()) {
                String trimmed = genreName.trim();
                Genre genre = genreRepository.findByName(trimmed);
                if (genre == null) {
                    genre = new Genre();
                    genre.setName(trimmed);
                    genre = genreRepository.save(genre);
                }
                genreList.add(genre);
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

    public MovieDto updateMovie(Long id, MovieDto movieDto, Long requestingUserId, boolean isAdmin) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie not found with id: " + id));

        if (!isAdmin && !Objects.equals(movie.getCreatorId(), requestingUserId)) {
            throw new ForbiddenException("You do not have permission to edit this movie.");
        }

        if (movieDto != null) {
            if (movieDto.getTitle() != null && !movieDto.getTitle().isBlank()) {
                movie.setTitle(movieDto.getTitle());
            }

            if (movieDto.getTmdbId() != null) {
                if (!movieDto.getTmdbId().equals(movie.getTmdbId()) &&
                        movieRepository.existsByTmdbIdAndCreatorId(movieDto.getTmdbId(), requestingUserId)) {
                    throw new DuplicateEntityException("You have already added this movie.");
                }
                movie.setTmdbId(movieDto.getTmdbId());
            }
            if (movieDto.getImage() != null) {
                movie.setImage(movieDto.getImage());
            }
            if (movieDto.getOverview() != null) {
                movie.setOverview(movieDto.getOverview());
            }

            if (movieDto.getGenres() != null) {
                List<Genre> genreList = new ArrayList<>();
                for (String genreName : movieDto.getGenres()) {
                    String trimmed = genreName.trim();
                    Genre genre = genreRepository.findByName(trimmed);
                    if (genre == null) {
                        genre = new Genre();
                        genre.setName(trimmed);
                        genre = genreRepository.save(genre);
                    }
                    genreList.add(genre);
                }
                movie.setGenres(genreList);
            }
        }

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
                .map(movie -> mapToSummaryWithLevel(movie, movie.getCreatorId()))
                .collect(Collectors.toList());
    }

    public List<MovieSummaryDto> getMoviesByTitle(String title) {
        List<Movie> movies = movieRepository.findByTitleContainingIgnoreCase(title);
        return movies.stream()
                .map(movie -> mapToSummaryWithLevel(movie, movie.getCreatorId()))
                .collect(Collectors.toList());
    }

    public List<MovieSummaryDto> getMoviesByUser(Long userId) {
        return movieRepository.findByCreatorId(userId).stream()
                .map(movie -> mapToSummaryWithLevel(movie, userId))
                .collect(Collectors.toList());
    }

    private MovieSummaryDto mapToSummaryWithLevel(Movie movie, Long userId) {
        MovieSummaryDto dto = movieMapper.toSummaryDto(movie);
        if (userId != null) {
            learningSetRepository.findTopByMovieIdAndCreatorIdOrderByDateDesc(movie.getId(), userId)
                    .ifPresent(set -> dto.setUserEnglishLevel(set.getEnglishLevel() != null ? set.getEnglishLevel().name() : null));
        }
        return dto;
    }

    public int getMoviesCountByUserId(Long userId) {
        return movieRepository.findByCreatorId(userId).size();
    }

}
