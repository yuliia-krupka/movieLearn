package co.backend.userLearningItemStatus.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerDto {
    private Long learningItemId;
    private boolean correct;
}
