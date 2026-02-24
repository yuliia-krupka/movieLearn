package co.backend.user;

import lombok.AllArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @PreAuthorize(value = "hasRole('ADMIN')")
    public ResponseEntity<String> setUserRole(
            @PathVariable Long userId,
            @PathVariable String roleName,
            @AuthenticationPrincipal OAuth2User oauth2User) {

        userService.setUserRole(userId, roleName, oauth2User);
        return ResponseEntity.ok("Role updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(value = "hasRole('ADMIN')")
    public void deleteUser(@PathVariable Long id, @AuthenticationPrincipal OAuth2User oauth2User) {
        userService.deleteUser(id, oauth2User);
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