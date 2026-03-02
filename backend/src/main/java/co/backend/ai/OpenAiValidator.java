package co.backend.ai;

import co.backend.exceptions.AiValidationException;
import co.backend.learningItem.LearningItemDto;
import co.backend.learningItem.LearningItemType;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@Slf4j
public class OpenAiValidator {

    private final Validator validator;

    public OpenAiValidator() {
        this.validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    public void validateGeneratedItems(List<LearningItemDto> dtos) {
        for (LearningItemDto dto : dtos) {
            Set<ConstraintViolation<LearningItemDto>> violations = validator.validate(dto);
            if (!violations.isEmpty()) {
                String errorMsg = violations.iterator().next().getMessage();
                log.warn("AI generated invalid data: {} for field '{}'", errorMsg,
                        violations.iterator().next().getPropertyPath());
                throw new AiValidationException("AI validation failed: " + errorMsg);
            }

            if (dto.getType() == LearningItemType.TEST) {
                if (dto.getAnswers() == null || dto.getAnswers().size() != 4) {
                    throw new AiValidationException("AI validation failed: Tests must have exactly 4 answers");
                }
                if (dto.getCorrectAnswerIndex() == null || dto.getCorrectAnswerIndex() < 0
                        || dto.getCorrectAnswerIndex() > 3) {
                    throw new AiValidationException(
                            "AI validation failed: Correct answer index must be between 0 and 3");
                }
                for (String answer : dto.getAnswers()) {
                    if (answer == null || answer.trim().isEmpty()) {
                        throw new AiValidationException("AI validation failed: Answer cannot be blank");
                    }
                    if (answer.length() > 100) {
                        throw new AiValidationException("AI validation failed: Answer cannot exceed 100 characters");
                    }
                }
            } else if (dto.getType() == LearningItemType.FLASH_CARD) {
                if (dto.getText() != null) {
                    int wordCount = dto.getText().split("\\s+").length;
                    if (wordCount > 5) {
                        log.warn("AI generated a full sentence instead of a phrase: '{}'", dto.getText());
                        throw new AiValidationException(
                                "AI returned a full sentence instead of a phrase: " + dto.getText());
                    }
                }
            }
        }
    }
}
