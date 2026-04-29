package co.backend.movie;

import co.backend.user.User;
import co.backend.user.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
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
    public List<MovieSummaryDto> getMovies(@RequestParam(required = false) List<String> genre,
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
    public MovieDto getMovieById(@PathVariable Long id, @AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getCurrentUserByEmail(principal.getAttribute("email"));
        boolean isAdmin = user.getRole() != null && user.getRole().name().equals("ADMIN");
        return movieService.getMovieById(id, user.getId(), isAdmin);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMovie(@PathVariable Long id,
                            @AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getCurrentUserByEmail(principal.getAttribute("email"));
        boolean isAdmin = user.getRole() != null && user.getRole().name().equals("ADMIN");
        movieService.deleteMovie(id, user.getId(), isAdmin);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @ResponseStatus(HttpStatus.CREATED)
    public MovieDto createMovie(@Valid @RequestPart("movieData") MovieDto movieDto,
                                @RequestPart(value = "script") MultipartFile script,
                                @RequestPart(value = "image", required = false) MultipartFile image,
                                @AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getCurrentUserByEmail(principal.getAttribute("email"));
        return movieService.createMovie(movieDto, script, image, user.getId());
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public MovieDto updateMovie(@PathVariable Long id,
                                @Valid @RequestPart("movieData") MovieDto movieDto,
                                @RequestPart(value = "image", required = false) MultipartFile image,
                                @AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getCurrentUserByEmail(principal.getAttribute("email"));
        boolean isAdmin = user.getRole() != null && user.getRole().name().equals("ADMIN");
        return movieService.updateMovie(id, movieDto, image, user.getId(), isAdmin);
    }

    @DeleteMapping("/{id}/image")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMovieImage(@PathVariable Long id,
                                 @AuthenticationPrincipal OAuth2User principal) {
        movieService.deleteMovieImage(id, principal.getAttribute("email"));
    }

    @GetMapping("/count")
    public int getMoviesCountByUserId(@AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getCurrentUserByEmail(principal.getAttribute("email"));
        return movieService.getMoviesCountByUserId(user.getId());
    }

    @GetMapping("/home")
    public List<MovieSummaryDto> getHomeMovies(@AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getCurrentUserByEmail(principal.getAttribute("email"));
        return movieService.getMoviesByUser(user.getId());
    }
}
