package co.backend.movie;

import co.backend.user.User;
import co.backend.user.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import jakarta.validation.Valid;

@AllArgsConstructor
@RestController
@RequestMapping("/api/movies")
public class MovieController {
    private final MovieService movieService;
    private final UserService userService;

    @GetMapping()
    public List<MovieDto> getMovies(@RequestParam(required = false) List<String> genre,
                                    @RequestParam(required = false) String title) {
        if (title != null && !title.isBlank()) {
            return movieService.getMoviesByTitle(title);
        } else if (genre != null && !genre.isEmpty()) {
            return movieService.getMoviesByGenres(genre);
        } else {
            return movieService.getAllMovies();
        }
    }

    @GetMapping("/{id}")
    public MovieDto getMovieById(@PathVariable Long id) {
        return movieService.getMovieById(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(value = "hasRole('ADMIN')")
    public void deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(value = "hasRole('ADMIN')")
    public MovieDto createMovie(@Valid @RequestPart("movieData") MovieDto movieDto,
                                @RequestPart(value = "image", required = false) MultipartFile image,
                                @RequestPart(value = "script", required = false) MultipartFile script) {
        return movieService.createMovie(movieDto, image, script);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize(value = "hasRole('ADMIN')")
    public MovieDto updateMovie(@PathVariable Long id,
                                @Valid @RequestPart("movieData") MovieDto movieDto,
                                @RequestPart(value = "image", required = false) MultipartFile image,
                                @RequestPart(value = "script", required = false) MultipartFile script) {
        return movieService.updateMovie(id, movieDto, image, script);
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getMovieImage(@PathVariable Long id) {
        MovieDto movie = movieService.getMovieById(id);
        byte[] imageData = movie.getImage();
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(imageData);
    }

    @GetMapping("/{id}/script")
    public ResponseEntity<byte[]> getMovieScript(@PathVariable Long id) {
        MovieDto movie = movieService.getMovieById(id);
        byte[] scriptData = movie.getScript();
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .body(scriptData);
    }

    @GetMapping("/count")
    public int getMoviesCountByUserId(@AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getCurrentUserByEmail(principal.getAttribute("email"));
        return movieService.getMoviesCountByUserId(user.getId());
    }

    @GetMapping("/home")
    public List<MovieDto> getHomeMovies(@AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getCurrentUserByEmail(principal.getAttribute("email"));
        return movieService.getMoviesByUser(user.getId());
    }

}
