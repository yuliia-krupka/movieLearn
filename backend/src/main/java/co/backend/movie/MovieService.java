package co.backend.movie;

import co.backend.exceptions.BadRequestException;
import co.backend.exceptions.FileUploadException;
import co.backend.exceptions.ForbiddenException;
import co.backend.exceptions.NotFoundException;
import co.backend.genre.Genre;
import co.backend.genre.GenreRepository;
import co.backend.learningSet.LearningSetRepository.MovieEnglishLevelProjection;
import co.backend.user.User;
import co.backend.user.UserService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
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

    public Page<MovieSummaryDto> getAllMovies(Long requestingUserId, Pageable pageable) {
        return getAllMovies(requestingUserId, null, null, pageable);
    }

    public Page<MovieSummaryDto> getAllMovies(Long requestingUserId, String title, List<String> genreNames, Pageable pageable) {
        List<Movie> movies;
        if (title != null && !title.isBlank()) {
            movies = movieRepository.findByTitleContainingIgnoreCase(title);
        } else if (genreNames != null && !genreNames.isEmpty()) {
            List<Genre> genres = genreRepository.findAllByNameIn(genreNames);
            movies = genres.isEmpty() ? List.of() : movieRepository.findByGenresIn(genres);
        } else if (pageable.isUnpaged()) {
            movies = movieRepository.findAll();
        } else {
            Page<Movie> page = movieRepository.findAll(pageable);
            List<MovieSummaryDto> dtos = enrichWithEnglishLevel(page.getContent(), requestingUserId);
            return new PageImpl<>(dtos, pageable, page.getTotalElements());
        }
        // For filtered/unpaged results: wrap the full list as a single Page
        List<MovieSummaryDto> dtos = enrichWithEnglishLevel(movies, requestingUserId);
        return new PageImpl<>(dtos, Pageable.unpaged(), dtos.size());
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
        if (script == null || script.isEmpty()) {
            throw new BadRequestException("Script file must be provided");
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

    public MovieDto updateMovie(Long id, MovieDto movieDto, MultipartFile image, MultipartFile script, Long requestingUserId, boolean isAdmin) {
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

        if (script != null && !script.isEmpty()) {
            try {
                movie.setScript(script.getBytes());
            } catch (IOException e) {
                throw new FileUploadException("Failed to upload script file", e);
            }
        }

        if (image != null && !image.isEmpty()) {
            try {
                movie.setImageData(image.getBytes());
            } catch (IOException e) {
                throw new FileUploadException("Failed to upload image", e);
            }
        }

        movie = movieRepository.save(movie);
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
    }

    public List<MovieSummaryDto> getMoviesByUser(Long userId) {
        List<Movie> movies = movieRepository.findByCreatorId(userId);
        return enrichWithEnglishLevel(movies, userId);
    }

    private List<MovieSummaryDto> enrichWithEnglishLevel(List<Movie> movies, Long userId) {
        List<MovieSummaryDto> dtos = movies.stream()
                .map(this::toSummaryDtoWithImage)
                .collect(Collectors.toList());

        if (userId != null && !movies.isEmpty()) {
            List<Long> movieIds = movies.stream().map(Movie::getId).toList();
            Map<Long, String> levelByMovieId = learningSetRepository
                    .findLatestEnglishLevelsByMovieIds(movieIds, userId)
                    .stream()
                    .collect(Collectors.toMap(
                            MovieEnglishLevelProjection::getMovieId,
                            p -> p.getEnglishLevel() != null ? p.getEnglishLevel().name() : null,
                            (existing, replacement) -> existing
                    ));
            dtos.forEach(dto -> dto.setUserEnglishLevel(levelByMovieId.get(dto.getId())));
        }
        return dtos;
    }

    public long getMoviesCountByUserId(Long userId) {
        return movieRepository.countByCreatorId(userId);
    }
}
