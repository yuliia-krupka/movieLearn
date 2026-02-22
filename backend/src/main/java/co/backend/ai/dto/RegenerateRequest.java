package co.backend.ai.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class RegenerateRequest {
    private Long learningSetId;
    private String feedback;
    private List<Long> itemIds;
}
