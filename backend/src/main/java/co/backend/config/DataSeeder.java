package co.backend.config;

import co.backend.genre.Genre;
import co.backend.genre.GenreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final GenreRepository genreRepository;

    @Override
    public void run(String... args) {
        seedGenres();
    }

    private void seedGenres() {
        List<String> genres = Arrays.asList(
                "Action", "Adventure", "Animation", "Comedy", "Crime",
                "Documentary", "Drama", "Family", "Fantasy", "History",
                "Horror", "Music", "Mystery", "Romance", "Sci-Fi",
                "Thriller", "War", "Western");

        int seededCount = 0;
        for (String genreName : genres) {
            if (!genreRepository.existsByName(genreName)) {
                Genre genre = new Genre();
                genre.setName(genreName);
                genreRepository.save(genre);
                seededCount++;
            }
        }

        if (seededCount > 0) {
            log.info("Seeded {} new genres.", seededCount);
        }
    }
}
