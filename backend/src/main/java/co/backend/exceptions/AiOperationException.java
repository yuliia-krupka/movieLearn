package co.backend.exceptions;

public class AiOperationException extends RuntimeException {
    public AiOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
