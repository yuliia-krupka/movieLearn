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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("LearningSetRepository — integration tests")
@Transactional
class LearningSetRepositoryIT extends AbstractIntegrationTest {

    @Autowired
    private LearningSetRepository learningSetRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private UserRepository userRepository;

    private User user;
    private Movie movie1;
    private Movie movie2;

    @BeforeEach
    void setUp() {
        learningSetRepository.deleteAll();
        movieRepository.deleteAll();
        userRepository.deleteAll();

        user = new User();
        user.setName("Yuliia");
        user.setLastname("Krupka");
        user.setEmail("yuliia@example.com");
        user.setEnglishLevel(EnglishLevel.B2);
        user.setRole(Role.USER);
        user = userRepository.save(user);

        movie1 = movieRepository.save(buildMovie("Interstellar", user.getId()));
        movie2 = movieRepository.save(buildMovie("Dune", user.getId()));

        learningSetRepository.save(
                buildLearningSet(movie1, user.getId(), EnglishLevel.B2, LearningSetStatus.READY));
        learningSetRepository.save(
                buildLearningSet(movie2, user.getId(), EnglishLevel.C1, LearningSetStatus.REVIEW));
    }

    @Test
    @DisplayName("findByMovieIdAndCreatorId — returns the correct learning set")
    void findByMovieIdAndCreatorId_returnsCorrectSet() {
        Optional<LearningSet> result =
                learningSetRepository.findByMovieIdAndCreatorId(movie1.getId(), user.getId());

        assertThat(result).isPresent();
        assertThat(result.get().getStatus()).isEqualTo(LearningSetStatus.READY);
        assertThat(result.get().getEnglishLevel()).isEqualTo(EnglishLevel.B2);
    }

    @Test
    @DisplayName("findByMovieIdAndCreatorId — returns empty Optional when no record exists")
    void findByMovieIdAndCreatorId_whenNotFound_returnsEmpty() {
        Optional<LearningSet> result =
                learningSetRepository.findByMovieIdAndCreatorId(movie1.getId(), 999L);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("findLatestEnglishLevelsByMovieIds — returns movieId -> englishLevel projection")
    void findLatestEnglishLevelsByMovieIds_returnsProjection() {
        List<LearningSetRepository.MovieEnglishLevelProjection> projections =
                learningSetRepository.findLatestEnglishLevelsByMovieIds(
                        List.of(movie1.getId(), movie2.getId())
                );

        assertThat(projections).hasSize(2);
        assertThat(projections)
                .extracting(LearningSetRepository.MovieEnglishLevelProjection::getMovieId)
                .containsExactlyInAnyOrder(movie1.getId(), movie2.getId());
    }

    @Test
    @DisplayName("deleteByCreatorId — removes all learning sets for a given user")
    void deleteByCreatorId_removesAllUserSets() {
        learningSetRepository.deleteByCreatorId(user.getId());

        assertThat(learningSetRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("deleteByMovieId — removes only the learning sets for the given movie")
    void deleteByMovieId_removesOnlyTargetMovieSets() {
        learningSetRepository.deleteByMovieId(movie1.getId());

        assertThat(learningSetRepository.findByMovieIdAndCreatorId(movie1.getId(), user.getId()))
                .isEmpty();
        assertThat(learningSetRepository.findByMovieIdAndCreatorId(movie2.getId(), user.getId()))
                .isPresent();
    }

    private Movie buildMovie(String title, Long creatorId) {
        Movie m = new Movie();
        m.setTitle(title);
        m.setCreatorId(creatorId);
        m.setScript("script".getBytes());
        m.setOverview("overview");
        return m;
    }

    private LearningSet buildLearningSet(Movie movie, Long creatorId,
                                         EnglishLevel level, LearningSetStatus status) {
        LearningSet ls = new LearningSet();
        ls.setName(movie.getTitle() + " set");
        ls.setMovie(movie);
        ls.setCreatorId(creatorId);
        ls.setEnglishLevel(level);
        ls.setStatus(status);
        ls.setDate(LocalDateTime.now());
        return ls;
    }
}
