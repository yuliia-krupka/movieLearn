package co.backend.movie;

import co.backend.genre.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    boolean existsByTitle(String title);

    List<Movie> findByTitleContainingIgnoreCase(String title);

    List<Movie> findByGenresContaining(Genre genre);

    int countMoviesByUsers_Id(Long userId);
}
