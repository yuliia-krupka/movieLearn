package co.backend.user;

import co.backend.exceptions.*;
import co.backend.learningSet.LearningSetRepository;
import co.backend.userLearningItemStatus.UserLearningItemStatusRepository;
import co.backend.userLearningSet.UserLearningSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final UserMapper userMapper;
    private final LearningSetRepository learningSetRepository;
    private final UserLearningSetRepository userLearningSetRepository;
    private final UserLearningItemStatusRepository userLearningItemStatusRepository;

    public List<UserDto> getAllUsers(String email) {
        List<User> users;
        if (email != null && !email.isBlank()) {
            users = userRepository.findByEmailContainingIgnoreCase(email);
        } else {
            users = userRepository.findAll();
        }
        return users.stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User with id " + id + " not found"));
        return userMapper.toDto(user);
    }

    public void deleteUser(Long id, OAuth2User principal) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }

        User currentUser = getCurrentUserByEmail(principal.getAttribute("email"));
        if (currentUser.getId().equals(id)) {
            throw new ForbiddenException("You cannot delete yourself");
        }

        User userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User with id " + id + " not found"));

        if (userToDelete.getRole() == Role.ADMIN) {
            throw new ForbiddenException("Cannot delete other admins");
        }

        userLearningItemStatusRepository.deleteByUserId(id);
        userLearningSetRepository.deleteByUserId(id);
        learningSetRepository.deleteByCreatorId(id);

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

    public void setUserRole(Long userId, String roleStr, OAuth2User principal) {
        User currentUser = getCurrentUserByEmail(principal.getAttribute("email"));
        if (currentUser.getId().equals(userId)) {
            throw new ForbiddenException("You cannot modify your own role");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        if (targetUser.getRole() == Role.ADMIN) {
            throw new ForbiddenException("Cannot modify other admin users");
        }

        Role role;
        try {
            role = Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new NotFoundException("Role not found: " + roleStr);
        }

        targetUser.setRole(role);
        userRepository.save(targetUser);
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
