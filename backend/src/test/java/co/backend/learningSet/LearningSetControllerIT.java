package co.backend.learningSet;

import co.backend.AbstractIntegrationTest;
import co.backend.movie.Movie;
import co.backend.movie.MovieRepository;
import co.backend.user.EnglishLevel;
import co.backend.user.Role;
import co.backend.user.User;
import co.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("LearningSetController — end-to-end HTTP tests")
class LearningSetControllerIT extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private LearningSetRepository learningSetRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private UserRepository userRepository;

    private LearningSet savedSet;

    @BeforeEach
    @Transactional
    void setUp() {
        learningSetRepository.deleteAll();
        movieRepository.deleteAll();
        userRepository.deleteAll();

        User user = new User();
        user.setName("Test");
        user.setLastname("User");
        user.setEmail("test-e2e@example.com");
        user.setRole(Role.USER);
        user.setEnglishLevel(EnglishLevel.A2);
        user = userRepository.save(user);

        Movie movie = new Movie();
        movie.setTitle("Test Movie");
        movie.setCreatorId(user.getId());
        movie.setScript("test script".getBytes());
        movie.setOverview("overview");
        movie = movieRepository.save(movie);

        LearningSet ls = new LearningSet();
        ls.setName("Test Set");
        ls.setMovie(movie);
        ls.setCreatorId(user.getId());
        ls.setEnglishLevel(EnglishLevel.A2);
        ls.setStatus(LearningSetStatus.READY);
        ls.setDate(LocalDateTime.now());
        savedSet = learningSetRepository.save(ls);
    }

    @Test
    @DisplayName("GET /api/learning-sets/{id} — unauthenticated request returns 401, 302, or 403")
    void getLearningSetById_withoutAuth_returnsUnauthorized() {
        ResponseEntity<String> response =
                restTemplate.getForEntity("/api/learning-sets/" + savedSet.getId(), String.class);

        assertThat(response.getStatusCode().value()).isIn(401, 302, 403);
    }

    @Test
    @DisplayName("GET /api/learning-sets/{id}/flashcards — unauthenticated request returns 401, 302, or 403")
    void getFlashcards_withoutAuth_returnsUnauthorized() {
        ResponseEntity<String> response =
                restTemplate.getForEntity(
                        "/api/learning-sets/" + savedSet.getId() + "/flashcards", String.class);

        assertThat(response.getStatusCode().value()).isIn(401, 302, 403);
    }

    @Test
    @DisplayName("GET /api/learning-sets/{id}/tests — unauthenticated request returns 401, 302, or 403")
    void getTestItems_withoutAuth_returnsUnauthorized() {
        ResponseEntity<String> response =
                restTemplate.getForEntity(
                        "/api/learning-sets/" + savedSet.getId() + "/tests", String.class);

        assertThat(response.getStatusCode().value()).isIn(401, 302, 403);
    }

    @Test
    @DisplayName("GET /api/learning-sets/movie/{movieId}/latest — unauthenticated returns 401, 302, or 403")
    void getLatestByUserAndMovie_withoutAuth_returnsUnauthorized() {
        Long movieId = savedSet.getMovie().getId();
        ResponseEntity<String> response =
                restTemplate.getForEntity(
                        "/api/learning-sets/movie/" + movieId + "/latest", String.class);

        assertThat(response.getStatusCode().value()).isIn(401, 302, 403);
    }

    @Test
    @DisplayName("POST /api/learning-sets/movie/{movieId}/start — unauthenticated returns 401, 302, or 403")
    void startLearning_withoutAuth_returnsUnauthorized() {
        Long movieId = savedSet.getMovie().getId();
        ResponseEntity<String> response =
                restTemplate.postForEntity(
                        "/api/learning-sets/movie/" + movieId + "/start", null, String.class);

        assertThat(response.getStatusCode().value()).isIn(401, 302, 403);
    }
}
