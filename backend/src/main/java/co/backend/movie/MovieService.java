package co.backend.movie;

import co.backend.exceptions.*;
import co.backend.genre.Genre;
import co.backend.genre.GenreRepository;
import co.backend.user.User;
import co.backend.user.UserRepository;
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

    public List<MovieDto> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(movieMapper::toDto)
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

    public MovieDto createMovie(MovieDto movieDto, MultipartFile image, MultipartFile script) {

        if (movieDto.getTitle() == null || movieDto.getTitle().isBlank()) {
            throw new DuplicateEntityException("Movie title cannot be empty");
        }
        if (movieRepository.existsByTitle(movieDto.getTitle())) {
            throw new DuplicateEntityException("Movie with title '" + movieDto.getTitle() + "' already exists");
        }

        Movie movie = new Movie();
        movie.setTitle(movieDto.getTitle());
        movie.setDescription(movieDto.getDescription());

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

        setMovieFiles(movie, image, script);

        movie = movieRepository.save(movie);
        return movieMapper.toDto(movie);
    }

    private void setMovieFiles(Movie movie, MultipartFile image, MultipartFile script) {
        try {
            if (image != null) {
                if (!image.isEmpty()) {
                    movie.setImage(image.getBytes());
                } else {
                    movie.setImage(null);
                }
            }
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

    public MovieDto updateMovie(Long id, MovieDto movieDto, MultipartFile image, MultipartFile script) {
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

            if (movieDto.getDescription() != null && !movieDto.getDescription().isBlank()) {
                movie.setDescription(movieDto.getDescription());
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

        setMovieFiles(movie, image, script);

        movie = movieRepository.save(movie);
        return movieMapper.toDto(movie);
    }

    public List<MovieDto> getMoviesByGenres(List<String> genreNames) {
        List<Genre> genres = genreRepository.findAllByNameIn(genreNames);
        if (genres.isEmpty()) {
            throw new NotFoundException("Genres not found");
        }

        List<Movie> movies = movieRepository.findByGenresIn(genres);

        return movies.stream()
                .map(movieMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<MovieDto> getMoviesByTitle(String title) {
        List<Movie> movies = movieRepository.findByTitleContainingIgnoreCase(title);
        return movies.stream()
                .map(movieMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<MovieDto> getMoviesByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User with id " + userId + " not found"));

        List<Movie> movies = user.getMovies();

        return movies.stream()
                .map(movieMapper::toDto)
                .collect(Collectors.toList());
    }

    public int getMoviesCountByUserId(Long userId) {
        return movieRepository.countMoviesByUsers_Id(userId);
    }

}
