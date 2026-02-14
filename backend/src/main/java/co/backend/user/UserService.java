package co.backend.user;

import co.backend.exceptions.FileSizeExceededException;
import co.backend.exceptions.FileUploadException;
import co.backend.exceptions.NotFoundException;
import co.backend.exceptions.UnsupportedFileTypeException;
import co.backend.movie.Movie;
import co.backend.movie.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final UserMapper userMapper;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User with id " + id + " not found"));
        return userMapper.toDto(user);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("User with id " + id + " not found");
        }
        userRepository.deleteById(id);
    }

    public UserDto createUserFromOAuth2(OAuth2User principal) {
        String name = principal.getAttribute("given_name");
        String lastname = principal.getAttribute("family_name");
        String email = principal.getAttribute("email");
        String pictureUrl = principal.getAttribute("picture");

        if (email == null) {
            throw new NotFoundException("Email not provided by OAuth2 provider");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setLastname(lastname);
            newUser.setRole(Role.USER);
            if (pictureUrl != null) {
                newUser.setPhoto(downloadImage(pictureUrl));
            }
            return userRepository.save(newUser);
        });

        return userMapper.toDto(user);
    }

    public UserDto updateUser(OAuth2User oauth2User, UserDto userDto) {
        User user = getCurrentUserByEmail(oauth2User.getAttribute("email"));

        if (userDto.getName() != null) {
            user.setName(userDto.getName());
        }

        if (userDto.getLastname() != null) {
            user.setLastname(userDto.getLastname());
        }

        if (userDto.getEnglishLevel() != null) {
            user.setEnglishLevel(userDto.getEnglishLevel());
        }

        if (userDto.getInterests() != null) {
            String interestsStr = userDto.getInterests().stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.joining(","));
            user.setInterests(interestsStr);
        }

        return userMapper.toDto(userRepository.save(user));
    }

    public UserDto getCurrentUser(OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        if (email == null) {
            throw new NotFoundException("Email not provided by OAuth2 provider");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));

        return userMapper.toDto(user);
    }

    public void setEnglishLevel(OAuth2User oauth2User, EnglishLevel level) {
        User user = getCurrentUserByEmail(oauth2User.getAttribute("email"));
        user.setEnglishLevel(level);
        userRepository.save(user);
    }

    public void saveOrUpdateInterests(OAuth2User oauth2User, List<String> interestNames) {
        User user = getCurrentUserByEmail(oauth2User.getAttribute("email"));

        String joined = interestNames.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining(","));

        user.setInterests(joined);
        userRepository.save(user);
    }

    public void saveAvatar(MultipartFile file, OAuth2User oauth2User) throws IOException {
        User user = getCurrentUserByEmail(oauth2User.getAttribute("email"));
        validateFile(file);
        byte[] avatarBytes = file.getBytes();
        user.setPhoto(avatarBytes);
        userRepository.save(user);
    }

    public void setUserRole(Long userId, String roleStr) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        Role role;
        try {
            role = Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new NotFoundException("Role not found: " + roleStr);
        }

        user.setRole(role);
        userRepository.save(user);
    }

    public void addMovieToUser(Long movieId, Long userId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new NotFoundException("Movie with id " + movieId + " not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User with id " + userId + " not found"));
        if (user.getMovies().contains(movie)) {
            return;
        }
        user.getMovies().add(movie);
        userRepository.save(user);
    }

    private void validateFile(MultipartFile file) {
        String fileType = file.getContentType();
        if (fileType == null || !fileType.startsWith("image/")) {
            throw new UnsupportedFileTypeException("Uploaded file must be an image");
        }

        long maxSize = 5 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new FileSizeExceededException("File size exceeds the limit of 5MB");
        }
    }

    private byte[] downloadImage(String imageUrl) {
        try (InputStream in = new URL(imageUrl).openStream()) {
            return in.readAllBytes();
        } catch (IOException e) {
            throw new FileUploadException("Unable to download image from: " + imageUrl, e);
        }
    }

    public User getCurrentUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));
    }
}
