package co.backend.user;

import co.backend.AbstractIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("UserRepository — integration tests")
@Transactional
class UserRepositoryIT extends AbstractIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    private User savedUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User user = new User();
        user.setName("Olena");
        user.setLastname("Kovalenko");
        user.setEmail("olena.kovalenko@example.com");
        user.setEnglishLevel(EnglishLevel.B2);
        user.setRole(Role.USER);

        savedUser = userRepository.save(user);
    }

    @Test
    @DisplayName("findByEmail — returns user when email exists")
    void findByEmail_whenExists_returnsUser() {
        Optional<User> result = userRepository.findByEmail("olena.kovalenko@example.com");

        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Olena");
        assertThat(result.get().getEnglishLevel()).isEqualTo(EnglishLevel.B2);
    }

    @Test
    @DisplayName("findByEmail — returns empty Optional when email does not exist")
    void findByEmail_whenNotExists_returnsEmpty() {
        Optional<User> result = userRepository.findByEmail("nobody@example.com");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("findByEmailContainingIgnoreCase — partial email search is case-insensitive")
    void findByEmailContainingIgnoreCase_returnsMatchingUsers() {
        User anotherUser = new User();
        anotherUser.setName("Ivan");
        anotherUser.setLastname("Shevchenko");
        anotherUser.setEmail("ivan.shevchenko@EXAMPLE.com");
        anotherUser.setRole(Role.USER);
        userRepository.save(anotherUser);

        List<User> result = userRepository.findByEmailContainingIgnoreCase("example.com");

        assertThat(result).hasSize(2);
        assertThat(result).extracting(User::getEmail)
                .containsExactlyInAnyOrder(
                        "olena.kovalenko@example.com",
                        "ivan.shevchenko@EXAMPLE.com"
                );
    }

    @Test
    @DisplayName("save — persists EnglishLevel enum as a string in the database")
    void save_persistsEnglishLevelAsString() {
        Optional<User> fromDb = userRepository.findById(savedUser.getId());

        assertThat(fromDb).isPresent();
        assertThat(fromDb.get().getEnglishLevel()).isEqualTo(EnglishLevel.B2);
    }
}
