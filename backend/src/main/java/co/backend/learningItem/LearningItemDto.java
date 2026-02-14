package co.backend.learningItem;

import lombok.Data;
import java.util.List;

@Data
public class LearningItemDto {
    private Long id;
    private LearningItemType type;
    private String text;
    private List<String> answers;
    private String exampleSentence;
    private String translation;
    private Long learningSetId;
}
