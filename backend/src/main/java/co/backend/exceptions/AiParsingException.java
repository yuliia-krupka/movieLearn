package co.backend.exceptions;

public class AiParsingException extends RuntimeException {
    public AiParsingException(String message, Throwable cause) {
        super(message, cause);
    }
}
