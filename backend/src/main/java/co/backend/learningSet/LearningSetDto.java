package co.backend.learningSet;

import co.backend.learningItem.LearningItemDto;
import co.backend.user.EnglishLevel;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class LearningSetDto {
    private Long id;
    private String name;
    private LocalDateTime date;
    private Long movieId;
    private LearningSetStatus status;
    private EnglishLevel englishLevel;
    private String interests;
    private List<LearningItemDto> learningItems;
}