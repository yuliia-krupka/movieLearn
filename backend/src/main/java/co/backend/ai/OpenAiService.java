package co.backend.ai;

import co.backend.ai.dto.ChatRequest;
import co.backend.ai.dto.ChatResponse;
import co.backend.ai.dto.GeneratedItem;
import co.backend.ai.dto.Message;
import co.backend.learningItem.LearningItemDto;
import co.backend.learningItem.LearningItemType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAiService {

    private final RestClient openAiRestClient;
    private final ObjectMapper objectMapper;

    @Value("${openai.model:gpt-4o}")
    private String modelName;

    private static final String FALLBACK_MODEL = "gpt-4o";

    private static final String SYSTEM_PROMPT = """
            You are a helpful assistant that generates language learning flashcards based on movie content.
            The user is a Ukrainian speaker learning English.
            Generate content that matches the user's English level and interests.
            Output purely JSON.
            """;

    public List<LearningItemDto> generateFlashcards(String movieTitle, String description, byte[] scriptBytes,
                                                    String interests, String level) {
        String scriptContent = parseScript(scriptBytes);

        String userPrompt = String.format(
                """
                        Generate 10 flashcards (words or phrases) from the movie "%s".
                        Movie Description: %s
                        Script Excerpt: %s
                        User Interests: %s
                        English Level: %s
                        
                        For each item, provide:
                        - text: The English word or phrase.
                        - translation: Ukrainian translation.
                        - transcription: IPA transcription.
                        - exampleSentence: A sentence using the word (preferably from the movie context).
                        
                        Return a JSON array of objects. Do not include markdown formatting like ```json.
                        """,
                movieTitle, description, scriptContent, interests, level);

        return callOpenAiList(userPrompt);
    }

    public LearningItemDto regenerateItem(LearningItemDto original, String instructions, String movieTitle,
                                          String description, String scriptContent, String level, String interests) {
        String userPrompt = String.format("""
                        Update the following flashcard based on these instructions: "%s"
                        Movie: "%s"
                        Description: "%s"
                        Script Excerpt: %s
                        User English Level: %s
                        User Interests: %s
                        
                        Original Item to CHANGE (Text: "%s"):
                        %s
                        
                        CRITICAL INSTRUCTIONS:
                        1. You MUST provide a DIFFERENT English "text" than the original. Do not echo back "%s".
                        2. If the original was good, provide a better synonym or a more advanced phrase from the script.
                        3. Return ONLY one updated flashcard as a single JSON object.
                        4. Do NOT include tests or questions.
                        """, instructions, movieTitle, description, scriptContent, level, interests, original.getText(),
                toJson(original), original.getText());

        return callOpenAiSingle(userPrompt, original, 1.0);
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
                - text: The English question or sentence with a blank (e.g. "She felt ___ after sharing her secret.").
                - translation: The Ukrainian translation of the word being tested.
                - transcription: IPA transcription of the word.
                - exampleSentence: The full correct sentence or a brief definition.
                - answers: An array of exactly 4 strings (options).
                - correctAnswerIndex: The integer index (0-3) of the correct answer in the answers array.
                
                Return a JSON array of objects. Do not include markdown formatting like ```json.
                """, flashcardsJson);

        return callOpenAiList(userPrompt);
    }

    public List<LearningItemDto> generateCustom(String instruction, String movieTitle, String description) {
        String userPrompt = String.format("""
                Generate 2 flashcards based on this request: "%s"
                Movie: "%s"
                Description: "%s"
                
                For each item, provide:
                - text: The English word or phrase.
                - translation: Ukrainian translation.
                - transcription: IPA transcription.
                - exampleSentence: A sentence using the word.
                
                Return a JSON array of objects.
                """, instruction, movieTitle, description);

        return callOpenAiList(userPrompt);
    }

    public List<LearningItemDto> regenerateBatch(List<LearningItemDto> originalItems, String instructions,
                                                 String movieTitle, String description, String scriptContent, String level, String interests) {
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
                        """,
                instructions, movieTitle, description, scriptContent, level, interests, itemsJson, originalTexts);

        return callOpenAiList(userPrompt, 1.0);
    }

    public String parseScript(byte[] scriptBytes) {
        if (scriptBytes == null || scriptBytes.length == 0) {
            return "";
        }
        if (isPdf(scriptBytes)) {
            try (PDDocument document = PDDocument.load(scriptBytes)) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            } catch (Exception e) {
                log.error("Error parsing PDF script, falling back to text parsing.", e);
                return new String(scriptBytes, StandardCharsets.UTF_8);
            }
        } else {
            return new String(scriptBytes, StandardCharsets.UTF_8);
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "";
        }
    }

    private LearningItemDto mapToDto(GeneratedItem item) {
        LearningItemDto dto = new LearningItemDto();
        dto.setText(item.getText());
        dto.setTranslation(item.getTranslation());
        dto.setTranscription(item.getTranscription());
        dto.setExampleSentence(item.getExampleSentence());

        if (item.getAnswers() != null && !item.getAnswers().isEmpty()) {
            dto.setType(LearningItemType.TEST);
            dto.setAnswers(item.getAnswers());
            dto.setCorrectAnswerIndex(item.getCorrectAnswerIndex());
        } else {
            dto.setType(LearningItemType.FLASH_CARD);
        }
        return dto;
    }

    private List<LearningItemDto> callOpenAiList(String userPrompt) {
        return callOpenAiList(userPrompt, 0.7);
    }

    private List<LearningItemDto> callOpenAiList(String userPrompt, double temperature) {
        try {
            return callWithModel(userPrompt, modelName, temperature);
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("Model {} not found, falling back to {}", modelName, FALLBACK_MODEL);
            return callWithModel(userPrompt, FALLBACK_MODEL, temperature);
        } catch (Exception e) {
            log.error("Error calling OpenAI for list. Prompt: {}, Error: {}", userPrompt, e.getMessage(), e);
            throw new RuntimeException("AI operation failed: " + e.getMessage());
        }
    }

    private List<LearningItemDto> callWithModel(String userPrompt, String model, double temperature) {
        ChatRequest request = new ChatRequest(model, List.of(
                new Message("system", SYSTEM_PROMPT),
                new Message("user", userPrompt)), temperature);

        try {
            List<LearningItemDto> generatedItems = getLearningItemDtos(request);
            return generatedItems != null ? generatedItems : new ArrayList<>();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse AI response", e);
        }
    }

    private LearningItemDto callOpenAiSingle(String userPrompt, LearningItemDto fallback) {
        return callOpenAiSingle(userPrompt, fallback, 0.7);
    }

    private LearningItemDto callOpenAiSingle(String userPrompt, LearningItemDto fallback, double temperature) {
        try {
            return callSingleWithModel(userPrompt, modelName, fallback, temperature);
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("Model {} not found, falling back to {}", modelName, FALLBACK_MODEL);
            try {
                return callSingleWithModel(userPrompt, FALLBACK_MODEL, fallback, temperature);
            } catch (Exception ex) {
                return fallback;
            }
        } catch (Exception e) {
            log.error("Error calling OpenAI for single item", e);
            return fallback;
        }
    }

    private LearningItemDto callSingleWithModel(String userPrompt, String model, LearningItemDto fallback,
                                                double temperature) {
        ChatRequest request = new ChatRequest(model, List.of(
                new Message("system", SYSTEM_PROMPT),
                new Message("user", userPrompt)), temperature);

        try {
            LearningItemDto generatedItem = getLearningItemDto(request);
            return generatedItem != null ? generatedItem : fallback;
        } catch (JsonProcessingException e) {
            return fallback;
        }
    }

    @Nullable
    private LearningItemDto getLearningItemDto(ChatRequest request) throws JsonProcessingException {
        ChatResponse response = openAiRestClient.post()
                .uri("/chat/completions")
                .body(request)
                .retrieve()
                .body(ChatResponse.class);

        if (response != null && !response.getChoices().isEmpty()) {
            String content = response.getChoices().get(0).getMessage().getContent();
            content = cleanJsonContent(content);

            GeneratedItem item = objectMapper.readValue(content, GeneratedItem.class);
            return mapToDto(item);
        }
        return null;
    }

    @Nullable
    private List<LearningItemDto> getLearningItemDtos(ChatRequest request) throws JsonProcessingException {
        ChatResponse response = openAiRestClient.post()
                .uri("/chat/completions")
                .body(request)
                .retrieve()
                .body(ChatResponse.class);

        if (response != null && !response.getChoices().isEmpty()) {
            String content = response.getChoices().get(0).getMessage().getContent();
            content = cleanJsonContent(content);

            if (content.startsWith("{")) {
                GeneratedItem item = objectMapper.readValue(content, GeneratedItem.class);
                return List.of(mapToDto(item));
            }

            List<GeneratedItem> generatedItems = objectMapper.readValue(content, new TypeReference<>() {
            });

            return generatedItems.stream().map(this::mapToDto).toList();
        }
        return null;
    }

    private String cleanJsonContent(String content) {
        content = content.trim();
        if (content.startsWith("```json")) {
            content = content.substring(7);
        } else if (content.startsWith("```")) {
            content = content.substring(3);
        }
        if (content.endsWith("```")) {
            content = content.substring(0, content.length() - 3);
        }
        return content.trim();
    }

    private boolean isPdf(byte[] bytes) {
        return bytes != null && bytes.length > 4 &&
                bytes[0] == 0x25 && // %
                bytes[1] == 0x50 && // P
                bytes[2] == 0x44 && // D
                bytes[3] == 0x46 && // F
                bytes[4] == 0x2D; // -
    }
}
