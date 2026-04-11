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
    private Long creatorId;
    @NotBlank(message = "Name must not be blank")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;
    private String image;
    private String overview;
    @NotEmpty(message = "Genres must be provided")
    private List<String> genres;
}
