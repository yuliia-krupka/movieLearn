package co.backend.movie;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
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
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;
    @NotBlank(message = "Name must not be blank")
    @Size(max = 600, message = "Description must not exceed 600 characters")
    private String description;
    @Size(max = 10485760, message = "Image size must not exceed 10MB")
    private byte[] image;
    @Size(max = 20971520, message = "Script size must not exceed 20MB")
    private byte[] script;
    @NotEmpty(message = "Genres must be provided")
    private List<String> genres;
}
