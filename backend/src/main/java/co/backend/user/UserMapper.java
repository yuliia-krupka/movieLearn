package co.backend.user;

import org.mapstruct.Mapper;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);

    default List<String> mapInterestsToList(String interests) {
        return interests == null || interests.isBlank()
                ? List.of()
                : Arrays.stream(interests.split(","))
                .map(String::trim)
                .collect(Collectors.toList());
    }
}
