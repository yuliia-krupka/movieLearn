package co.backend.movie;

import co.backend.exceptions.BadRequestException;
import co.backend.exceptions.FileUploadException;
import co.backend.exceptions.ForbiddenException;
import co.backend.exceptions.NotFoundException;
import co.backend.genre.Genre;
import co.backend.genre.GenreRepository;
import co.backend.user.User;
import co.backend.user.UserService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
@Transactional
public class MovieService {
    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final UserService userService;
    private final MovieMapper movieMapper;
    private final co.backend.learningSet.LearningSetRepository learningSetRepository;

    private static final String ABSTRACT_IMAGE_PREFIX = "/abstract/abstract-";

    private String resolveImageUrl(Movie movie) {
        if (movie.getImageData() != null && movie.getImageData().length > 0) {
            return "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(movie.getImageData());
        }
        return ABSTRACT_IMAGE_PREFIX + ((movie.getId() * 7) % 10 + 1) + ".svg";
    }

    private MovieDto toDtoWithImage(Movie movie) {
        MovieDto dto = movieMapper.toDto(movie);
        dto.setImage(resolveImageUrl(movie));
        return dto;
    }

    private MovieSummaryDto toSummaryDtoWithImage(Movie movie) {
        MovieSummaryDto dto = movieMapper.toSummaryDto(movie);
        dto.setImage(resolveImageUrl(movie));
        return dto;
    }

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

        return toDtoWithImage(movie);
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

    public MovieDto createMovie(MovieDto movieDto, MultipartFile script, MultipartFile image, Long creatorId) {
        if (movieDto.getTitle() == null || movieDto.getTitle().isBlank()) {
            throw new BadRequestException("Movie title cannot be empty");
        }

        Movie movie = new Movie();
        movie.setTitle(movieDto.getTitle());
        movie.setCreatorId(creatorId);

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

        setMovieFiles(movie, script, image);

        movie = movieRepository.save(movie);
        return toDtoWithImage(movie);
    }

    private void setMovieFiles(Movie movie, MultipartFile script, MultipartFile image) {
        try {
            if (script != null && !script.isEmpty()) {
                movie.setScript(script.getBytes());
            }
            if (image != null && !image.isEmpty()) {
                movie.setImageData(image.getBytes());
            }
        } catch (IOException e) {
            throw new FileUploadException("Failed to upload files", e);
        }
    }

    public MovieDto updateMovie(Long id, MovieDto movieDto, MultipartFile image, Long requestingUserId, boolean isAdmin) {
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

        if (image != null && !image.isEmpty()) {
            try {
                movie.setImageData(image.getBytes());
            } catch (IOException e) {
                throw new FileUploadException("Failed to upload image", e);
            }
            movie = movieRepository.save(movie);
        } else {
            movie = movieRepository.save(movie);
        }
        return toDtoWithImage(movie);
    }

    public void deleteMovieImage(Long id, String email) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie not found with id: " + id));

        User user = userService.getCurrentUserByEmail(email);
        boolean isAdmin = user.getRole() != null && user.getRole().name().equals("ADMIN");

        if (!isAdmin && !Objects.equals(movie.getCreatorId(), user.getId())) {
            throw new ForbiddenException("You do not have permission to edit this movie.");
        }

        movieRepository.clearImageData(id);

        movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie not found with id: " + id));
        toDtoWithImage(movie);
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
        MovieSummaryDto dto = toSummaryDtoWithImage(movie);
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
