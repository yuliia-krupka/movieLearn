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
        set.setName("Vocabulary: " + movie.getTitle());
        set.setDate(LocalDateTime.now());
        set.setMovie(movie);

        List<LearningItem> items = new ArrayList<>();

        // --- FLASH CARD items ---
        items.add(createFlashCard(set, "endeavor",
                "A journey is a great endeavor that requires courage.",
                "починання, зусилля"));

        items.add(createFlashCard(set, "reluctant",
                "She was reluctant to leave the safety of her home.",
                "неохочий, з небажанням"));

        items.add(createFlashCard(set, "compelling",
                "The story was so compelling that I couldn't stop watching.",
                "переконливий, захопливий"));

        items.add(createFlashCard(set, "resilience",
                "His resilience helped him overcome every obstacle.",
                "стійкість, витривалість"));

        items.add(createFlashCard(set, "betrayal",
                "The betrayal by his closest friend left him devastated.",
                "зрада"));

        items.add(createFlashCard(set, "suspense",
                "The suspense kept the audience on the edge of their seats.",
                "напруга, невизначеність"));

        items.add(createFlashCard(set, "revelation",
                "The final revelation changed everything they believed in.",
                "відкриття, одкровення"));

        items.add(createFlashCard(set, "ominous",
                "Dark clouds gathered in an ominous sky.",
                "зловісний, загрозливий"));

        items.add(createFlashCard(set, "pursue",
                "He decided to pursue his dreams no matter the cost.",
                "переслідувати, прагнути"));

        items.add(createFlashCard(set, "treacherous",
                "The path through the mountains was treacherous.",
                "підступний, зрадливий"));

        // --- TEST items (множинний вибір) ---
        items.add(createTestItem(set, "What does 'endeavor' mean?",
                List.of("A lazy attempt", "A serious effort or attempt", "A loud noise",
                        "A type of food"),
                "починання, зусилля"));

        items.add(createTestItem(set, "Choose the correct synonym for 'reluctant':",
                List.of("Eager", "Unwilling", "Happy", "Brave"),
                "неохочий"));

        items.add(createTestItem(set, "Which sentence uses 'compelling' correctly?",
                List.of(
                        "The boring movie was compelling.",
                        "She made a compelling argument for change.",
                        "He compelled his lunch quickly.",
                        "The compelling weather was nice."),
                "переконливий"));

        items.add(createTestItem(set, "'Resilience' is closest in meaning to:",
                List.of("Weakness", "Toughness and ability to recover", "Speed", "Intelligence"),
                "стійкість"));

        items.add(createTestItem(set, "Fill in the blank: 'The ___ by his ally shocked everyone.'",
                List.of("resilience", "betrayal", "endeavor", "suspense"),
                "зрада"));

        set.setLearningItems(items);
        return set;
    }

    private LearningItem createFlashCard(LearningSet set, String word, String sentence, String translation) {
        LearningItem item = new LearningItem();
        item.setType(LearningItemType.FLASH_CARD);
        item.setText(word);
        item.setExampleSentence(sentence);
        item.setTranslation(translation);
        item.setLearningSet(set);
        return item;
    }

    private LearningItem createTestItem(LearningSet set, String question, List<String> answers, String translation) {
        LearningItem item = new LearningItem();
        item.setType(LearningItemType.TEST);
        item.setText(question);
        item.setAnswers(answers);
        item.setTranslation(translation);
        item.setLearningSet(set);
        return item;
    }
}