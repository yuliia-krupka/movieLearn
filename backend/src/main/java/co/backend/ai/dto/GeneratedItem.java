package co.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedItem {
    private String text;
    private String translation;
    private String transcription;
    private String exampleSentence;

    // Test generation fields
    private List<String> answers;
    private Integer correctAnswerIndex;
}
