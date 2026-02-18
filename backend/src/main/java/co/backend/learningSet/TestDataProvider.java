package co.backend.learningSet;

import co.backend.learningItem.LearningItem;
import co.backend.learningItem.LearningItemType;
import co.backend.movie.Movie;
import co.backend.movie.MovieRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@AllArgsConstructor
public class TestDataProvider {

    private final MovieRepository movieRepository;

    public LearningSet createTestLearningSet(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found: " + movieId));

        LearningSet set = new LearningSet();
        set.setName(movie.getTitle());
        set.setDate(LocalDateTime.now());
        set.setMovie(movie);

        List<LearningItem> items = new ArrayList<>();

        // --- FLASH CARD items ---
        items.add(createFlashCard(set, "endeavor",
                "A journey is a great endeavor that requires courage.",
                "починання, зусилля", "[ɪnˈdɛv.ər]"));

        items.add(createFlashCard(set, "reluctant",
                "She was reluctant to leave the safety of her home.",
                "неохочий, з небажанням", "[rɪˈlʌk.tənt]"));

        items.add(createFlashCard(set, "compelling",
                "The story was so compelling that I couldn't stop watching.",
                "переконливий, захопливий", "[kəmˈpɛl.ɪŋ]"));

        items.add(createFlashCard(set, "resilience",
                "His resilience helped him overcome every obstacle.",
                "стійкість, витривалість", "[rɪˈzɪl.jəns]"));

        items.add(createFlashCard(set, "betrayal",
                "The betrayal by his closest friend left him devastated.",
                "зрада", "[bɪˈtreɪ.əl]"));

        items.add(createFlashCard(set, "suspense",
                "The suspense kept the audience on the edge of their seats.",
                "напруга, невизначеність", "[səˈspɛns]"));

        items.add(createFlashCard(set, "revelation",
                "The final revelation changed everything they believed in.",
                "відкриття, одкровення", "[ˌrɛv.əˈleɪ.ʃən]"));

        items.add(createFlashCard(set, "ominous",
                "Dark clouds gathered in an ominous sky.",
                "зловісний, загрозливий", "[ˈɒm.ɪ.nəs]"));

        items.add(createFlashCard(set, "pursue",
                "He decided to pursue his dreams no matter the cost.",
                "переслідувати, прагнути", "[pəˈsjuː]"));

        items.add(createFlashCard(set, "treacherous",
                "The path through the mountains was treacherous.",
                "підступний, зрадливий", "[ˈtrɛtʃ.ər.əs]"));

        // --- TEST items (множинний вибір) ---
        items.add(createTestItem(set, "What does 'endeavor' mean?",
                List.of("A lazy attempt", "A loud noise",
                        "A serious effort or attempt", "A type of food"),
                2, "починання, зусилля"));

        items.add(createTestItem(set, "Choose the correct synonym for 'reluctant':",
                List.of("Eager", "Happy", "Brave", "Unwilling"),
                3, "неохочий"));

        items.add(createTestItem(set, "Which sentence uses 'compelling' correctly?",
                List.of(
                        "She made a compelling argument for change.",
                        "The boring movie was compelling.",
                        "He compelled his lunch quickly.",
                        "The compelling weather was nice."),
                0, "переконливий"));

        items.add(createTestItem(set, "'Resilience' is closest in meaning to:",
                List.of("Weakness", "Speed", "Intelligence",
                        "Toughness and ability to recover"),
                3, "стійкість"));

        items.add(createTestItem(set, "Fill in the blank: 'The ___ by his ally shocked everyone.'",
                List.of("resilience", "endeavor", "betrayal", "suspense"),
                2, "зрада"));

        items.add(createTestItem(set, "What is a synonym for 'inevitable'?",
                List.of("Uncertain", "Unavoidable", "Unlikely", "Mistaken"),
                1, "неминучий"));

        items.add(createTestItem(set, "'Ambiguous' means:",
                List.of("Funny", "Clear and precise", "Open to more than one interpretation", "Angry"),
                2, "двозначний"));

        items.add(createTestItem(set, "Choose the correct use of 'elaborate':",
                List.of("He elaborate the dinner.", "Could you please elaborate on that idea?",
                        "The elaborate was tasty.", "She walked elaborate."),
                1, "деталізувати / складний"));

        items.add(createTestItem(set, "'Subtle' is best described as:",
                List.of("Loud and obvious", "Bright and colorful", "Delicate or precise",
                        "Heavy and strong"),
                2, "тонкий, ледь помітний"));

        items.add(createTestItem(set, "Fill in the blank: 'She felt ___ after sharing her secret.'",
                List.of("vulnerable", "ambiguous", "elaborate", "inevitable"),
                0, "вразливий"));

        set.setLearningItems(items);
        return set;
    }

    private LearningItem createFlashCard(LearningSet set, String word, String sentence, String translation,
                                         String transcription) {
        LearningItem item = new LearningItem();
        item.setType(LearningItemType.FLASH_CARD);
        item.setText(word);
        item.setExampleSentence(sentence);
        item.setTranslation(translation);
        item.setTranscription(transcription);
        item.setLearningSet(set);
        return item;
    }

    private LearningItem createTestItem(LearningSet set, String question, List<String> answers,
                                        int correctAnswerIndex, String translation) {
        LearningItem item = new LearningItem();
        item.setType(LearningItemType.TEST);
        item.setText(question);
        item.setAnswers(answers);
        item.setCorrectAnswerIndex(correctAnswerIndex);
        item.setTranslation(translation);
        item.setLearningSet(set);
        return item;
    }
}