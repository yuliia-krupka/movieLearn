package co.backend.movie;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/movies")
public class MovieController {
    private final MovieService movieService;

    @GetMapping()
    public List<MovieDto> getMovies(@RequestParam(required = false) String genre,
                                    @RequestParam(required = false) String title) {
        if (title != null && !title.isBlank()) {
            return movieService.getMoviesByTitle(title);
        } else if (genre != null && !genre.equalsIgnoreCase("all") && !genre.isBlank()) {
            return movieService.getMoviesByGenre(genre);
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
    public void deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @ResponseStatus(HttpStatus.CREATED)
    public MovieDto createMovie(@RequestPart("movieData") MovieDto movieDto,
                                @RequestPart(value = "image", required = false) MultipartFile image,
                                @RequestPart(value = "script", required = false) MultipartFile script) {
        return movieService.createMovie(movieDto, image, script);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public MovieDto updateMovie(@PathVariable Long id,
                                @RequestPart(value = "movieData", required = false) MovieDto movieDto,
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
}
