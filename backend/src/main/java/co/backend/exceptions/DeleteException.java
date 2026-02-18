package co.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class DeleteException extends RuntimeException {
    public DeleteException(String message) {
        super(message);
    }
}
