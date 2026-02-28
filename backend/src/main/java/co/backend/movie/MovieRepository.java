package co.backend.movie;

import co.backend.genre.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    boolean existsByTitle(String title);

    List<Movie> findByTitleContainingIgnoreCase(String title);

    List<Movie> findByGenresIn(Collection<Genre> genres);

    List<Movie> findAllByGenres_Id(Long id);

    @Query("SELECT COUNT(ls) > 0 FROM LearningSet ls WHERE ls.movie.id = :movieId")
    boolean hasAnyLearningSets(@Param("movieId") Long movieId);
}
