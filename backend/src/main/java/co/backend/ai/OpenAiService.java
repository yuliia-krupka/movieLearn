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

    private static final String SYSTEM_PROMPT = """
            You are a helpful assistant that generates language learning flashcards based on movie content.
            The user is a Ukrainian speaker learning English.
            Generate content that matches the user's English level and interests.
            Output purely JSON.
            """;

    public List<LearningItemDto> generateFlashcards(
            String movieTitle,
            String description,
            String scriptContent,
            String interests,
            String level) {
        String userPrompt = String.format(
                """
                        Generate 10 flashcards (words or phrases) from the movie "%s".
                        Movie Description: %s
                        Script Excerpt: %s
                        User Interests: %s
                        English Level: %s
                        
                        For each item, provide:
                        - text: The English word or phrase (MAX 70 chars).
                        - translation: Ukrainian translation (MAX 150 chars).
                        - transcription: IPA transcription (MAX 100 chars).
                        - exampleSentence: A sentence using the word from the movie context (MAX 150 chars).
                        """,
                movieTitle, description, scriptContent, interests, level);

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
                - translation: The Ukrainian translation of the word being tested (MAX 150 chars).
                - transcription: IPA transcription of the word (MAX 100 chars).
                - exampleSentence: The full correct sentence or a brief definition (MAX 150 chars).
                - answers: An array of exactly 4 strings (options) (Each option MAX 100 chars).
                - correctAnswerIndex: The integer index (0-3) of the correct answer in the answers array.
                """, flashcardsJson);

        return generate(userPrompt, 0.7, LearningItemType.TEST);
    }

    public List<LearningItemDto> regenerateBatch(
            List<LearningItemDto> originalItems,
            String instructions,
            String movieTitle,
            String description,
            String scriptContent,
            String level,
            String interests) {
        String originalTexts = String.join(", ", originalItems.stream().map(LearningItemDto::getText).toList());
        String itemsJson = toJson(originalItems);
        String userPrompt = String.format(
                """
                        Update the following flashcards based on these instructions: "%s"
                        Movie: "%s"
                        Description: "%s"
                        Script Excerpt: %s
                        User English Level: %s
                        User Interests: %s
                        
                        Original Items to CHANGE:
                        %s
                        
                        CRITICAL INSTRUCTIONS:
                        1. For EVERY item in "Original Items", you MUST provide a NEW English word or phrase.
                        2. DO NOT ECHO BACK these words: [%s].
                        3. If the user asks to "add N more", add N NEW items from the movie script in addition to the updated originals.
                        4. Return the results as a JSON array.
                        5. Do NOT include test items. Return ONLY vocabulary flashcards.
                        6. Total items returned MUST BE (Number of Originals) + (Number of New requested).
                        7. ADHERE TO LIMITS: text (70 chars), translation (150 chars), exampleSentence (150 chars), transcription (100 chars).
                        """,
                instructions, movieTitle, description, scriptContent, level, interests, itemsJson, originalTexts);

        return generate(userPrompt, 1.0, LearningItemType.FLASH_CARD);
    }

    private List<LearningItemDto> generate(String prompt, double temperature, LearningItemType type) {
        try {
            List<GeneratedItem> items = chatClient.prompt()
                    .system(SYSTEM_PROMPT)
                    .user(prompt)
                    .options(OpenAiChatOptions.builder().temperature(temperature).build())
                    .call()
                    .entity(new ParameterizedTypeReference<>() {
                    });
            return items == null ? List.of()
                    : items.stream().map(item -> learningItemMapper.fromGenerated(item, type)).toList();
        } catch (Exception e) {
            log.error("Error calling OpenAI: {}", e.getMessage(), e);
            throw new AiOperationException("AI operation failed. Please try again.", e);
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "";
        }
    }
}
