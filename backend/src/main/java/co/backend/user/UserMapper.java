package co.backend.user;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "interests", expression = "java(mapInterestsToString(userDto.getInterests()))")
    User toEntity(UserDto userDto);

    @Mapping(target = "interests", expression = "java(mapInterestsToList(user.getInterests()))")
    UserDto toDto(User user);

    default String mapInterestsToString(List<String> interests) {
        return interests == null ? null : String.join(",", interests);
    }

    default List<String> mapInterestsToList(String interests) {
        return interests == null || interests.isBlank()
                ? List.of()
                : Arrays.stream(interests.split(","))
                .map(String::trim)
                .collect(Collectors.toList());
    }
}
