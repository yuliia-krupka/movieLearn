package co.backend.learningItem;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class LearningItemService {
    private final LearningItemRepository learningItemRepository;

}
