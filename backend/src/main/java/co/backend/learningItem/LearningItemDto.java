package co.backend.learningItem;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class LearningItemDto {
    private Long id;
    @NotNull(message = "Type cannot be null")
    private LearningItemType type;

    @NotBlank(message = "Text cannot be empty")
    @Size(max = 70, message = "Text cannot exceed 70 characters")
    private String text;

    private List<String> answers;

    @Size(max = 180, message = "Example sentence cannot exceed 180 characters")
    private String exampleSentence;

    @Size(max = 100, message = "Transcription cannot exceed 100 characters")
    private String transcription;

    @NotBlank(message = "Translation cannot be empty")
    @Size(max = 150, message = "Translation cannot exceed 150 characters")
    private String translation;

    private Integer correctAnswerIndex;
    private Long learningSetId;
}
