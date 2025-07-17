package co.backend.genre;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class GenreDto {
    private Long id;

    @NotBlank(message = "Name must not be blank")
    private String name;
}
