package co.backend.movie;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MovieSummaryDto {
    private Long id;
    private String title;
    private Integer tmdbId;
    private String posterPath;
    private String overview;
    private List<String> genres;
    private Long creatorId;
    private String userEnglishLevel;
}
