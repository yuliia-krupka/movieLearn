package co.backend.user;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Slf4j
@AllArgsConstructor
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/account")
    public UserDto getCurrentUser(@AuthenticationPrincipal OAuth2User oauth2User) {
        return userService.getCurrentUser(oauth2User);
    }

    @GetMapping
    public List<UserDto> getAllUsers(@RequestParam(required = false) String email) {
        return userService.getAllUsers(email);
    }

    @PutMapping("/{userId}/role/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> setUserRole(
            @PathVariable Long userId,
            @PathVariable String roleName,
            @AuthenticationPrincipal OAuth2User oauth2User) {

        UserDto currentUser = userService.getCurrentUser(oauth2User);
        if (currentUser.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You cannot modify your own role");
        }

        UserDto targetUser = userService.getUserById(userId);
        if (targetUser == null) {
            return ResponseEntity.notFound().build();
        }

        if ("ADMIN".equalsIgnoreCase(String.valueOf(targetUser.getRole()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Cannot modify other admin users");
        }

        try {
            userService.setUserRole(userId, roleName.toUpperCase());
            return ResponseEntity.ok("Role updated successfully");

        } catch (Exception e) {
            log.error("Error setting user role for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update user role: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @AuthenticationPrincipal OAuth2User oauth2User) {
        try {
            UserDto currentUser = userService.getCurrentUser(oauth2User);

            if (currentUser.getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You cannot delete yourself");
            }
            UserDto userToDelete = userService.getUserById(id);
            if (userToDelete == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            if ("ADMIN".equalsIgnoreCase(String.valueOf(userToDelete.getRole()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cannot delete other admins");
            }

            userService.deleteUser(id);
            return ResponseEntity.ok().body("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete user");
        }
    }

    @PutMapping("/movies/{movieId}")
    public void addMovieToUser(
            @PathVariable Long movieId,
            @AuthenticationPrincipal OAuth2User oauth2User) {
        UserDto user = userService.getCurrentUser(oauth2User);
        userService.addMovieToUser(movieId, user.getId());
    }

    @PutMapping("/account/update")
    public UserDto updateUser(@AuthenticationPrincipal OAuth2User oauth2User, @RequestBody UserDto userDto) {
        return userService.updateUser(oauth2User, userDto);
    }

    @PutMapping("/level/{level}")
    public void setEnglishLevel(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable EnglishLevel level) {
        userService.setEnglishLevel(oauth2User, level);
    }

    @PutMapping("/interests")
    public void setInterests(@AuthenticationPrincipal OAuth2User oauth2User, @RequestBody List<String> interests) {
        userService.saveOrUpdateInterests(oauth2User, interests);
    }

    @PutMapping("/photo/upload")
    public void uploadPhoto(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestPart("file") MultipartFile file) throws IOException {
        userService.saveAvatar(file, oauth2User);
    }

    @GetMapping("/photo/{userId}")
    public ResponseEntity<byte[]> getProfilePictureByUserId(@PathVariable Long userId) {
        UserDto userDto = userService.getUserById(userId);

        if (userDto == null || userDto.getPhoto() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(userDto.getPhoto());
    }

}