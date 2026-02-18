package co.backend.security;

import co.backend.user.UserDto;
import co.backend.user.UserMapper;
import co.backend.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class Oauth2CustomSuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final UserMapper userMapper;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        UserDto userDto = userService.createUserFromOAuth2(oauth2User);

        UserDto currentUserDto = userMapper.toDto(userService.getCurrentUserByEmail(userDto.getEmail()));

        if (currentUserDto.getEnglishLevel() != null && currentUserDto.getInterests() != null
                && !currentUserDto.getInterests().isEmpty()) {
            response.sendRedirect(frontendUrl + "/home");
        } else if (currentUserDto.getEnglishLevel() != null) {
            response.sendRedirect(frontendUrl + "/interests");
        } else {
            response.sendRedirect(frontendUrl + "/level");
        }
    }
}
