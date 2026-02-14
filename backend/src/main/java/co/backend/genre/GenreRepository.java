package co.backend.genre;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GenreRepository extends JpaRepository<Genre, Long> {
    boolean existsByName(String name);

    Genre findByName(String name);

    List<Genre> findAllByNameIn(List<String> genreNames);
}
