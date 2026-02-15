package co.backend.learningSet;

import co.backend.learningItem.LearningItemDto;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class LearningSetDto {
    private Long id;
    private String name;
    private LocalDateTime date;
    private Long movieId;
    private List<LearningItemDto> learningItems;
}