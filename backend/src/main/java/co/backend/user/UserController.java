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
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(userService.getCurrentUser(oauth2User));
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
        if (oauth2User == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        userService.setUserRole(userId, roleName, oauth2User);
        return ResponseEntity.ok("Role updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(value = "hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, @AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        userService.deleteUser(id, oauth2User);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/account/update")
    public ResponseEntity<UserDto> updateUser(@AuthenticationPrincipal OAuth2User oauth2User,
                                              @RequestBody UserDto userDto) {
        if (oauth2User == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(userService.updateUser(oauth2User, userDto));
    }

    @PutMapping("/level/{level}")
    public ResponseEntity<Void> setEnglishLevel(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable EnglishLevel level) {
        if (oauth2User == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        userService.setEnglishLevel(oauth2User, level);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/interests")
    public ResponseEntity<Void> setInterests(@AuthenticationPrincipal OAuth2User oauth2User,
                                             @RequestBody List<String> interests) {
        if (oauth2User == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        userService.saveOrUpdateInterests(oauth2User, interests);
        return ResponseEntity.ok().build();
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