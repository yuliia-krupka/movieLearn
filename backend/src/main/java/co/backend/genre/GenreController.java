package co.backend.genre;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/genres")
public class GenreController {
    private final GenreService genreService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(value = "hasRole('ADMIN')")
    public GenreDto createGenre(@RequestBody @Valid GenreDto genreDto) {
        return genreService.createGenre(genreDto);
    }

    @PutMapping("/{id}")
    @PreAuthorize(value = "hasRole('ADMIN')")
    public GenreDto updateGenre(@PathVariable Long id, @RequestBody @Valid GenreDto genreDto) {
        return genreService.updateGenre(id, genreDto);
    }

    @GetMapping
    public List<GenreDto> getAllGenres() {
        return genreService.getAllGenres();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(value = "hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGenre(@PathVariable Long id) {
        genreService.deleteGenre(id);
    }

    @GetMapping("/{id}")
    @PreAuthorize(value = "hasRole('ADMIN')")
    public GenreDto getGenreById(@PathVariable Long id) {
        return genreService.getGenreById(id);
    }
}
