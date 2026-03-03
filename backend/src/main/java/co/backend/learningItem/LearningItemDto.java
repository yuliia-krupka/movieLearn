package co.backend.learningItem;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
    @Size(max = 255, message = "Text cannot exceed 255 characters")
    private String text;

    @Size(max = 4, message = "Answers cannot exceed 4 items")
    private List<@NotBlank(message = "Answer cannot be blank") @Size(max = 255, message = "Answer cannot exceed 255 characters") String> answers;

    @Size(max = 255, message = "Example sentence cannot exceed 255 characters")
    private String exampleSentence;

    @Size(max = 255, message = "Transcription cannot exceed 255 characters")
    private String transcription;

    @NotBlank(message = "Translation cannot be empty")
    @Size(max = 255, message = "Translation cannot exceed 255 characters")
    private String translation;

    @Min(value = 0, message = "Correct answer index must be at least 0")
    @Max(value = 3, message = "Correct answer index must be at most 3")
    private Integer correctAnswerIndex;

    private Long learningSetId;
}
