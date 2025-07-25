package co.backend.user;

import co.backend.exceptions.FileSizeExceededException;
import co.backend.exceptions.FileUploadException;
import co.backend.exceptions.NotFoundException;
import co.backend.exceptions.UnsupportedFileTypeException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
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

        return userMapper.toDTO(user);
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

        if (userDto.getInterests() != null && !userDto.getInterests().isEmpty()) {
            user.setInterests(userDto.getInterests());
        }

        return userMapper.toDTO(userRepository.save(user));
    }


    public UserDto getCurrentUser(OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        if (email == null) {
            throw new NotFoundException("Email not provided by OAuth2 provider");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));

        return userMapper.toDTO(user);
    }

    public void setEnglishLevel(OAuth2User oauth2User, EnglishLevel level) {
        User user = getCurrentUserByEmail(oauth2User.getAttribute("email"));
        user.setEnglishLevel(level);
        userRepository.save(user);
    }

    public void saveOrUpdateInterests(OAuth2User oauth2User, List<String> interestNames) {
        User user = getCurrentUserByEmail(oauth2User.getAttribute("email"));

        List<String> interests = new ArrayList<>();
        for (String interestName : interestNames) {
            interestName = interestName.trim();
            if (!interestName.isEmpty()) {
                interests.add(interestName);
            }
        }
        user.setInterests(interests);
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

    private User getCurrentUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));
    }
}
