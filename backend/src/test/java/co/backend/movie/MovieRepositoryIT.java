package co.backend.movie;

import co.backend.AbstractIntegrationTest;
import co.backend.user.EnglishLevel;
import co.backend.user.Role;
import co.backend.user.User;
import co.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("MovieRepository — integration tests")
@Transactional
class MovieRepositoryIT extends AbstractIntegrationTest {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private UserRepository userRepository;

    private User creator;

    @BeforeEach
    void setUp() {
        movieRepository.deleteAll();
        userRepository.deleteAll();

        creator = new User();
        creator.setName("Taras");
        creator.setLastname("Melnyk");
        creator.setEmail("taras.melnyk@example.com");
        creator.setEnglishLevel(EnglishLevel.C1);
        creator.setRole(Role.USER);
        creator = userRepository.save(creator);

        Movie movie1 = buildMovie("The Dark Knight", creator.getId());
        Movie movie2 = buildMovie("Inception", creator.getId());
        Movie movie3 = buildMovie("Dark Waters", creator.getId());
        movieRepository.saveAll(List.of(movie1, movie2, movie3));
    }

    @Test
    @DisplayName("findByTitleContainingIgnoreCase — finds movies by partial title match")
    void findByTitleContainingIgnoreCase_returnsMatchingMovies() {
        List<Movie> darkMovies = movieRepository.findByTitleContainingIgnoreCase("dark");

        assertThat(darkMovies).hasSize(2);
        assertThat(darkMovies).extracting(Movie::getTitle)
                .containsExactlyInAnyOrder("The Dark Knight", "Dark Waters");
    }

    @Test
    @DisplayName("findByCreatorId — returns only movies belonging to the given creator")
    void findByCreatorId_returnsOnlyCreatorsMovies() {
        User otherCreator = new User();
        otherCreator.setName("Maria");
        otherCreator.setLastname("Petrenko");
        otherCreator.setEmail("maria@example.com");
        otherCreator.setRole(Role.USER);
        otherCreator = userRepository.save(otherCreator);

        Movie foreignMovie = buildMovie("Foreign Film", otherCreator.getId());
        movieRepository.save(foreignMovie);

        List<Movie> creatorMovies = movieRepository.findByCreatorId(creator.getId());

        assertThat(creatorMovies).hasSize(3);
        assertThat(creatorMovies).extracting(Movie::getCreatorId)
                .containsOnly(creator.getId());
    }

    @Test
    @DisplayName("countByCreatorId — returns the correct count of movies for a creator")
    void countByCreatorId_returnsCorrectCount() {
        long count = movieRepository.countByCreatorId(creator.getId());

        assertThat(count).isEqualTo(3);
    }

    @Test
    @DisplayName("findAll(Pageable) — returns a correctly paginated result")
    void findAll_withPageable_returnsPaginatedResults() {
        Page<Movie> page = movieRepository.findAll(PageRequest.of(0, 2));

        assertThat(page.getContent()).hasSize(2);
        assertThat(page.getTotalElements()).isEqualTo(3);
        assertThat(page.getTotalPages()).isEqualTo(2);
    }

    @Test
    @DisplayName("deleteByCreatorId — removes all movies belonging to a creator")
    void deleteByCreatorId_removesAllCreatorMovies() {
        movieRepository.deleteByCreatorId(creator.getId());

        List<Movie> remaining = movieRepository.findByCreatorId(creator.getId());
        assertThat(remaining).isEmpty();
    }

    private Movie buildMovie(String title, Long creatorId) {
        Movie movie = new Movie();
        movie.setTitle(title);
        movie.setCreatorId(creatorId);
        movie.setScript("Test script content".getBytes());
        movie.setOverview("Test overview");
        return movie;
    }
}
