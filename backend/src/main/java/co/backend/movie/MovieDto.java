package co.backend.movie;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MovieDto {
    private Long id;
    @NotBlank(message = "Name must not be blank")
    private String title;
    @NotBlank(message = "Name must not be blank")
    private String description;
    private byte[] image;
    private byte[] script;
    @NotEmpty(message = "Genres must be provided")
    private List<String> genres;
}
