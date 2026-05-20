package co.backend.learningItem;

import co.backend.AbstractIntegrationTest;
import co.backend.learningSet.LearningSet;
import co.backend.learningSet.LearningSetRepository;
import co.backend.learningSet.LearningSetStatus;
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

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("LearningItemRepository — integration tests")
@Transactional
class LearningItemRepositoryIT extends AbstractIntegrationTest {

    @Autowired
    private LearningItemRepository learningItemRepository;

    @Autowired
    private LearningSetRepository learningSetRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private UserRepository userRepository;

    private LearningSet learningSet;

    @BeforeEach
    void setUp() {
        learningItemRepository.deleteAll();
        learningSetRepository.deleteAll();
        movieRepository.deleteAll();
        userRepository.deleteAll();

        User user = new User();
        user.setName("Andrii");
        user.setLastname("Bondarenko");
        user.setEmail("andrii@example.com");
        user.setRole(Role.USER);
        user.setEnglishLevel(EnglishLevel.B1);
        user = userRepository.save(user);

        Movie movie = new Movie();
        movie.setTitle("The Shawshank Redemption");
        movie.setCreatorId(user.getId());
        movie.setScript("Some script".getBytes());
        movie.setOverview("Classic film");
        movie = movieRepository.save(movie);

        learningSet = new LearningSet();
        learningSet.setName("Shawshank set");
        learningSet.setMovie(movie);
        learningSet.setCreatorId(user.getId());
        learningSet.setEnglishLevel(EnglishLevel.B1);
        learningSet.setStatus(LearningSetStatus.READY);
        learningSet.setDate(LocalDateTime.now());
        learningSet = learningSetRepository.save(learningSet);
    }

    @Test
    @DisplayName("findByLearningSetId — returns all items for the given learning set")
    void findByLearningSetId_returnsAllItemsForSet() {
        LearningItem flashcard = buildItem("redemption", LearningItemType.FLASH_CARD, learningSet);
        LearningItem testItem = buildItem("warden", LearningItemType.TEST, learningSet);
        learningItemRepository.saveAll(List.of(flashcard, testItem));

        List<LearningItem> result = learningItemRepository.findByLearningSetId(learningSet.getId());

        assertThat(result).hasSize(2);
        assertThat(result).extracting(LearningItem::getText)
                .containsExactlyInAnyOrder("redemption", "warden");
    }

    @Test
    @DisplayName("findByLearningSetId — returns empty list when the learning set has no items")
    void findByLearningSetId_whenNoItems_returnsEmpty() {
        List<LearningItem> result = learningItemRepository.findByLearningSetId(999L);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("save — persists the @ElementCollection answers in a separate join table")
    void save_persistsAnswersCollection() {
        LearningItem item = buildItem("prison", LearningItemType.TEST, learningSet);
        item.setAnswers(List.of("jail", "school", "hospital", "prison"));
        item.setCorrectAnswerIndex(3);
        LearningItem saved = learningItemRepository.save(item);

        learningItemRepository.flush();
        LearningItem fromDb = learningItemRepository.findById(saved.getId()).orElseThrow();

        assertThat(fromDb.getAnswers())
                .containsExactlyInAnyOrder("jail", "school", "hospital", "prison");
        assertThat(fromDb.getCorrectAnswerIndex()).isEqualTo(3);
    }

    @Test
    @DisplayName("cascade delete — deleting a LearningSet removes its LearningItems (orphanRemoval)")
    void cascadeDelete_whenLearningSetDeleted_itemsAreRemoved() {
        LearningItem item = buildItem("freedom", LearningItemType.FLASH_CARD, learningSet);
        learningSet.getLearningItems().add(item);
        learningItemRepository.save(item);
        learningItemRepository.flush();

        learningSetRepository.delete(learningSet);
        learningSetRepository.flush();

        assertThat(learningItemRepository.findById(item.getId())).isEmpty();
    }

    private LearningItem buildItem(String text, LearningItemType type, LearningSet ls) {
        LearningItem item = new LearningItem();
        item.setText(text);
        item.setType(type);
        item.setTranslation("translation");
        item.setTranscription("[ˈsʌmθɪŋ]");
        item.setExampleSentence("Example sentence with " + text);
        item.setLearningSet(ls);
        return item;
    }
}
