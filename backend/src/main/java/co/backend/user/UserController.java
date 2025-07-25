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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{userId}/role")
    public ResponseEntity<Void> setUserRole(
            @PathVariable Long userId,
            @RequestBody String roleName) {
        userService.setUserRole(userId, roleName);
        return ResponseEntity.noContent().build();
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

    @GetMapping("/photo")
    public ResponseEntity<byte[]> getProfilePicture(@AuthenticationPrincipal OAuth2User oauth2User) {
        UserDto userDto = userService.getCurrentUser(oauth2User);

        if (userDto.getPhoto() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(userDto.getPhoto());
    }


}