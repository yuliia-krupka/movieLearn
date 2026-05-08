package co.backend.movie;

import co.backend.genre.Genre;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    @EntityGraph(attributePaths = {"genres"})
    Page<Movie> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"genres"})
    List<Movie> findByTitleContainingIgnoreCase(String title);

    List<Movie> findByGenresIn(Collection<Genre> genres);

    List<Movie> findAllByGenres_Id(Long id);

    @EntityGraph(attributePaths = {"genres"})
    List<Movie> findByCreatorId(Long creatorId);

    long countByCreatorId(Long creatorId);

    void deleteByCreatorId(Long creatorId);

    @Modifying
    @Query("UPDATE Movie m SET m.imageData = null WHERE m.id = :id")
    void clearImageData(@Param("id") Long id);
}
