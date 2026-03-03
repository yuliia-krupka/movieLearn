package co.backend.ai;

import co.backend.ai.dto.GeneratedItem;
import co.backend.exceptions.AiOperationException;
import co.backend.learningItem.LearningItemDto;
import co.backend.learningItem.LearningItemMapper;
import co.backend.learningItem.LearningItemType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAiService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;
    private final LearningItemMapper learningItemMapper;
    private final RetryTemplate aiRetryTemplate;
    private final OpenAiValidator openAiValidator;

    private static final String SYSTEM_PROMPT = """
            You are a specialized language learning assistant. Your goal is to extract high-value vocabulary from movie scripts.
            Target Audience: Ukrainian speakers learning English.
            Key Rule: A flashcard 'text' field must be a single word, a collocation, a phrasal verb, or an idiom.
            NEVER use full sentences or long dialogue lines as the 'text' of a flashcard, even if they appear in the script.
            Adjust the complexity and rarity of chosen vocabulary based on the user's English level (especially for B2-C2 levels).
            Output strictly valid JSON.
            """;

    public List<LearningItemDto> generateFlashcards(
            String movieTitle,
            String scriptContent,
            String interests,
            String level) {
        String userPrompt = String.format(
                """
                        Extract 10 high-quality vocabulary items (words, idioms, or collocations) from the movie "%s".
                        
                        Context:
                        Script Excerpt: %s
                        
                        User Profile:
                        Interests: %s
                        English Level: %s
                        
                        Selection Guidelines:
                        1. NO FULL SENTENCES: The 'text' field must be a vocabulary unit (e.g., "resounding success", "take into account", "epiphany"), NOT a full sentence from the dialogue.
                        2. LEVEL-APPROPRIATE: For B2, C1, and C2 levels, strictly avoid simple words. Prioritize sophisticated academic vocabulary, industry-specific terms, and native-like idioms found in the script.
                        3. INTERESTS: Focus on items relevant to user's interests if they appear in the script.
                        
                        For each item, provide:
                        - text: The English word or phrase (MAX 255 chars).
                        - translation: Accurate Ukrainian translation (MAX 255 chars).
                        - transcription: IPA transcription enclosed in slashes (MAX 150 chars).
                        - exampleSentence: The actual sentence from the movie where this item is used (MAX 255 chars).
                        Do not use one word or phrase more than once in a set of flashcards!
                        """,
                movieTitle, scriptContent, interests, level);

        return generate(userPrompt, 0.7, LearningItemType.FLASH_CARD);
    }

    public List<LearningItemDto> generateTests(List<LearningItemDto> flashcards) {
        String flashcardsJson = toJson(flashcards);
        String userPrompt = String.format("""
                Based on the following flashcards, generate a language test.
                For each flashcard, create one test question.
                
                VARY the question types significantly across the test items. Do NOT just ask for translations.
                Use these types as inspiration:
                1. Usage: "Choose the correct use of 'elaborate':"
                2. Definition: "'Subtle' is best described as:"
                3. Context: "Fill in the blank: 'She felt ___ after sharing her secret.'"
                4. Synonym/Antonym: "Which of these is a synonym for 'inevitable'?"
                
                Each test question MUST have exactly 4 options (one correct, three incorrect).
                
                Flashcards: %s
                
                For each test item, provide:
                - text: The English question or sentence with a blank (MAX 255 chars).
                - translation: The Ukrainian translation of the word being tested (MAX 255 chars).
                - transcription: IPA transcription of the word enclosed in slashes, e.g. /wɜːrd/ (MAX 150 chars).
                - exampleSentence: The full correct sentence or a brief definition (MAX 255 chars).
                - answers: An array of exactly 4 strings (options) (Each option MAX 150 chars).
                - correctAnswerIndex: The integer index (0-3) of the correct answer in the answers array.
                """, flashcardsJson);

        return generate(userPrompt, 0.7, LearningItemType.TEST);
    }

    public List<LearningItemDto> regenerateBatch(
            List<LearningItemDto> originalItems,
            String instructions,
            String movieTitle,
            String scriptContent,
            String level,
            String interests) {
        String originalTexts = String.join(", ", originalItems.stream().map(LearningItemDto::getText).toList());
        String itemsJson = toJson(originalItems);
        String userPrompt = String.format(
                """
                        Update the following flashcards based on these instructions: "%s"
                        
                        Context:
                        Movie: "%s"
                        Script Excerpt: %s
                        User English Level: %s
                        User Interests: %s
                        
                        Original Items to REPLACE:
                        %s
                        
                        CRITICAL CONSTRAINTS:
                        1. NEW VOCABULARY: For EVERY item in "Original Items", you MUST provide a DIFFERENT English word or phrase from the script.
                        2. NO DUPLICATES: DO NOT reuse these words: [%s].
                        3. NO FULL SENTENCES: Ensure the 'text' field contains only a word or phrase, never a full sentence.
                        4. SOPHISTICATION: If level is B2, C1, or C2, use advanced collocations and idioms from the script.
                        5. ADHERE TO LIMITS: text (255 chars), translation (255 chars), exampleSentence (255 chars), transcription (150 chars in slashes).
                        6. Return the results as a JSON array of vocabulary flashcards only.
                        """,
                instructions, movieTitle, scriptContent, level, interests, itemsJson, originalTexts);

        return generate(userPrompt, 1.0, LearningItemType.FLASH_CARD);
    }

    private List<LearningItemDto> generate(String prompt, double temperature, LearningItemType type) {
        try {
            return aiRetryTemplate.execute(context -> {
                if (context.getRetryCount() > 0) {
                    log.warn("Retrying AI request, attempt #{}", context.getRetryCount() + 1);
                }

                List<GeneratedItem> items = chatClient.prompt()
                        .system(SYSTEM_PROMPT)
                        .user(prompt)
                        .options(OpenAiChatOptions.builder().temperature(temperature).build())
                        .call()
                        .entity(new ParameterizedTypeReference<>() {
                        });

                if (items == null)
                    return List.of();

                List<LearningItemDto> dtos = items.stream()
                        .map(item -> learningItemMapper.fromGenerated(item, type))
                        .toList();

                validateGeneratedItems(dtos);

                return dtos;
            });
        } catch (Exception e) {
            log.error("Error calling OpenAI after retries: {}", e.getMessage(), e);
            throw new AiOperationException("AI operation failed. Please try again.", e);
        }
    }

    private void validateGeneratedItems(List<LearningItemDto> dtos) {
        openAiValidator.validateGeneratedItems(dtos);
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "";
        }
    }
}
