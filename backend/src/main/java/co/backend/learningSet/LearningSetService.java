package co.backend.learningSet;

import co.backend.exceptions.BadRequestException;
import co.backend.exceptions.NotFoundException;
import co.backend.learningItem.LearningItem;
import co.backend.learningItem.LearningItemDto;
import co.backend.learningItem.LearningItemMapper;
import co.backend.learningItem.LearningItemRepository;
import co.backend.learningItem.LearningItemType;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Transactional
public class LearningSetService {

    private final LearningSetRepository learningSetRepository;
    private final LearningSetMapper learningSetMapper;
    private final LearningItemMapper learningItemMapper;
    private final LearningItemRepository learningItemRepository;
    private final TestDataProvider testDataProvider;
    private final co.backend.ai.OpenAiService openAiService;
    private final co.backend.movie.MovieRepository movieRepository;
    private final co.backend.user.UserRepository userRepository;
    private final co.backend.userLearningSet.UserLearningSetService userLearningSetService;

    public LearningSetDto generateForUser(Long movieId, Long userId) {
        System.out.println("[BACKEND] generateForUser called - movieId: " + movieId + ", userId: " + userId);

        co.backend.movie.Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new NotFoundException("Movie not found: " + movieId));

        co.backend.user.User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        System.out.println("User level: " + user.getEnglishLevel() + ", interests: " + user.getInterests());

        if (user.getEnglishLevel() != null && user.getInterests() != null) {
            System.out.println("Looking for suitable shared set...");
            Optional<LearningSetDto> suitableSet = findSuitableSet(movieId, user.getEnglishLevel(), user.getInterests());
            if (suitableSet.isPresent()) {
                System.out.println("[BACKEND] Found suitable shared set, reusing: " + suitableSet.get().getId());
                userLearningSetService.getOrCreate(userId, suitableSet.get().getId());
                return suitableSet.get();
            } else {
                System.out.println("No suitable shared set found");
            }
        }

        if (user.getEnglishLevel() != null) {
            System.out.println("Looking for user's existing set with same level...");
            Optional<LearningSetDto> existingSet = getLatestByUserAndMovieWithLevel(userId, movieId, user.getEnglishLevel());
            if (existingSet.isPresent()) {
                String userInterests = user.getInterests();
                String existingInterests = existingSet.get().getInterests();

                boolean interestsMatch = interestsMatch(userInterests, existingInterests);

                System.out.println("User interests: '" + userInterests + "', Existing interests: '" + existingInterests + "', Match: " + interestsMatch);

                if (interestsMatch) {
                    System.out.println("[BACKEND] Found matching user set, reusing: " + existingSet.get().getId());
                    return existingSet.get();
                } else {
                    System.out.println("User has set with same level but different interests, will generate new");
                }
            } else {
                System.out.println("No existing user set found with same level");
            }
        }

        System.out.println("[BACKEND] Generating new learning set...");
        List<LearningItemDto> generatedItems = openAiService.generateFlashcards(
                movie.getTitle(),
                movie.getDescription(),
                movie.getScript(),
                user.getInterests(),
                user.getEnglishLevel() != null ? user.getEnglishLevel().name() : "B1");

        LearningSet set = new LearningSet();
        set.setMovie(movie);
        set.setDate(java.time.LocalDateTime.now());
        set.setName("AI Set for " + movie.getTitle());
        set.setCreatorId(userId);
        set.setStatus(LearningSetStatus.REVIEW);
        set.setEnglishLevel(user.getEnglishLevel());
        set.setInterests(user.getInterests());

        LearningSet savedSet = learningSetRepository.save(set);
        addItemsToSet(savedSet, generatedItems);

        userLearningSetService.getOrCreate(userId, savedSet.getId());

        System.out.println("[BACKEND] Generated new learning set: " + savedSet.getId() + " with " + generatedItems.size() + " items");
        return learningSetMapper.toDto(savedSet);
    }

    public LearningSetDto generateForMovie(Long movieId) {
        LearningSet set = testDataProvider.createTestLearningSet(movieId);
        LearningSet saved = learningSetRepository.save(set);
        return learningSetMapper.toDto(saved);
    }

    public Optional<LearningSetDto> getLatestByMovieId(Long movieId) {
        return learningSetRepository.findTopByMovieIdOrderByDateDesc(movieId)
                .map(learningSetMapper::toDto);
    }

    public Optional<LearningSetDto> getLatestByUserAndMovie(Long userId, Long movieId) {
        return learningSetRepository.findTopByMovieIdAndCreatorIdOrderByDateDesc(movieId, userId)
                .map(learningSetMapper::toDto);
    }

    public Optional<LearningSetDto> getLatestByUserAndMovieWithLevel(Long userId, Long movieId,
                                                                     co.backend.user.EnglishLevel level) {
        return learningSetRepository.findTopByMovieIdAndCreatorIdAndEnglishLevelOrderByDateDesc(movieId, userId, level)
                .map(learningSetMapper::toDto);
    }

    public Optional<LearningSetDto> findSuitableSet(Long movieId, co.backend.user.EnglishLevel level,
                                                    String interests) {
        // First try exact match
        Optional<LearningSetDto> exactMatch = learningSetRepository
                .findTopByMovieIdAndEnglishLevelAndInterestsOrderByDateDesc(movieId, level, interests)
                .map(learningSetMapper::toDto);

        if (exactMatch.isPresent()) {
            return exactMatch;
        }

        // If no exact match, try flexible interest matching
        List<LearningSet> candidateSets = learningSetRepository
                .findByMovieIdAndEnglishLevelOrderByDateDesc(movieId, level);

        for (LearningSet candidate : candidateSets) {
            if (interestsMatch(interests, candidate.getInterests())) {
                System.out.println("[BACKEND] Found flexible match: user interests='" + interests +
                        "' vs existing='" + candidate.getInterests() + "'");
                return Optional.of(learningSetMapper.toDto(candidate));
            }
        }

        return Optional.empty();
    }

    private boolean interestsMatch(String userInterests, String existingInterests) {
        if (userInterests == null && existingInterests == null) return true;
        if (userInterests == null || existingInterests == null) return false;

        // Split by commas and normalize
        String[] userInterestsArray = userInterests.toLowerCase().split("[,\\s]+");
        String[] existingInterestsArray = existingInterests.toLowerCase().split("[,\\s]+");

        // Remove empty strings and trim
        java.util.Set<String> userSet = java.util.Arrays.stream(userInterestsArray)
                .filter(s -> !s.trim().isEmpty())
                .map(String::trim)
                .collect(java.util.stream.Collectors.toSet());

        java.util.Set<String> existingSet = java.util.Arrays.stream(existingInterestsArray)
                .filter(s -> !s.trim().isEmpty())
                .map(String::trim)
                .collect(java.util.stream.Collectors.toSet());

        return userSet.equals(existingSet);
    }

    public LearningSetDto getOrCreateByMovieId(Long movieId) {
        LearningSetDto potentialSet = getLatestByMovieId(movieId).orElse(null);

        if (potentialSet == null) {
            return generateForMovie(movieId);
        }

        if (potentialSet.getLearningItems() == null || potentialSet.getLearningItems().isEmpty()) {
            try {
                learningSetRepository.deleteById(potentialSet.getId());
            } catch (Exception e) {
                System.out.println("Could not delete empty set " + potentialSet.getId() + ": " + e.getMessage());
            }
            return generateForMovie(movieId);
        }

        return potentialSet;
    }

    public LearningSetDto getById(Long id) {
        return learningSetMapper.toDto(findSetById(id));
    }

    public void updateStatus(Long id, LearningSetStatus status) {
        LearningSet set = findSetById(id);
        set.setStatus(status);
        learningSetRepository.save(set);
    }

    public void approveSet(Long id) {
        updateStatus(id, LearningSetStatus.READY);
    }

    public void updateItems(Long id, List<LearningItemDto> items) {
        LearningSet set = findSetById(id);
        set.getLearningItems().clear();
        addItemsToSet(set, items);
    }

    public LearningItemDto regenerateItem(Long setId, Long itemId, String instructions) {
        LearningSet set = findSetById(setId);

        co.backend.learningItem.LearningItem item = set.getLearningItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Item not found in set: " + itemId));

        LearningItemDto currentDto = learningItemMapper.toDto(item);
        LearningItemDto updatedDto = openAiService.regenerateItem(currentDto, instructions);

        item.setText(updatedDto.getText());
        item.setTranslation(updatedDto.getTranslation());
        item.setTranscription(updatedDto.getTranscription());
        item.setExampleSentence(updatedDto.getExampleSentence());

        learningSetRepository.save(set);

        return learningItemMapper.toDto(item);
    }

    public List<LearningItemDto> getFlashCardsByLearningSetId(Long learningSetId) {
        return getItemsByType(learningSetId, LearningItemType.FLASH_CARD);
    }

    public List<LearningItemDto> getTestItemsByLearningSetId(Long learningSetId) {
        LearningSet set = findSetById(learningSetId);

        List<LearningItem> existingTests = set.getLearningItems().stream()
                .filter(item -> item.getType() == LearningItemType.TEST)
                .toList();

        List<LearningItem> flashcards = set.getLearningItems().stream()
                .filter(item -> item.getType() == LearningItemType.FLASH_CARD)
                .toList();

        if (existingTests.isEmpty()) {
            System.out.println("No tests found, generating new ones for learning set: " + learningSetId);
            return generateTestsForSet(learningSetId);
        }

        if (flashcards.isEmpty()) {
            System.out.println("No flashcards found, returning empty tests for learning set: " + learningSetId);
            return existingTests.stream().map(learningItemMapper::toDto).toList();
        }

        java.time.LocalDateTime latestFlashcardUpdate = flashcards.stream()
                .map(flashcard -> flashcard.getUpdatedAt() != null ? flashcard.getUpdatedAt() : flashcard.getCreatedAt())
                .max(Comparator.naturalOrder())
                .orElse(null);

        java.time.LocalDateTime latestTestCreation = existingTests.stream()
                .map(LearningItem::getCreatedAt)
                .max(Comparator.naturalOrder())
                .orElse(null);

        if (latestFlashcardUpdate.isAfter(latestTestCreation)) {
            System.out.println("Flashcards updated after tests, regenerating tests for learning set: " + learningSetId);
            System.out.println("Latest flashcard update: " + latestFlashcardUpdate + ", Latest test creation: " + latestTestCreation);

            deleteTestsForSet(learningSetId);
            return generateTestsForSet(learningSetId);
        }

        System.out.println("Tests are up to date, returning existing tests for learning set: " + learningSetId);
        return existingTests.stream().map(learningItemMapper::toDto).toList();
    }

    private void deleteTestsForSet(Long learningSetId) {
        LearningSet set = findSetById(learningSetId);
        List<LearningItem> testsToDelete = set.getLearningItems().stream()
                .filter(item -> item.getType() == LearningItemType.TEST)
                .toList();

        if (!testsToDelete.isEmpty()) {
            System.out.println("Deleting " + testsToDelete.size() + " existing tests for learning set: " + learningSetId);
            learningItemRepository.deleteAll(testsToDelete);
            set.getLearningItems().removeAll(testsToDelete);
            learningSetRepository.save(set);
        }
    }

    public List<LearningItemDto> generateTestsForSet(Long learningSetId) {
        LearningSet set = findSetById(learningSetId);

        List<LearningItemDto> existingTests = set.getLearningItems().stream()
                .filter(item -> item.getType() == LearningItemType.TEST)
                .map(learningItemMapper::toDto)
                .toList();

        if (!existingTests.isEmpty()) {
            return existingTests;
        }

        List<LearningItemDto> flashcards = set.getLearningItems().stream()
                .filter(item -> item.getType() == LearningItemType.FLASH_CARD)
                .map(learningItemMapper::toDto)
                .toList();

        if (flashcards.isEmpty()) {
            throw new NotFoundException("No flashcards found to generate tests from");
        }

        List<LearningItemDto> generatedTestsDto = openAiService.generateTests(flashcards);
        addItemsToSet(set, generatedTestsDto);
        return generatedTestsDto;
    }

    private LearningSet findSetById(Long id) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }
        return learningSetRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Learning set not found: " + id));
    }

    private void addItemsToSet(LearningSet set, List<LearningItemDto> dtos) {
        List<LearningItem> items = dtos.stream()
                .map(dto -> {
                    LearningItem item = learningItemMapper.toEntity(dto);
                    item.setLearningSet(set);
                    return item;
                })
                .toList();
        set.getLearningItems().addAll(items);
        learningSetRepository.save(set);
    }

    private List<LearningItemDto> getItemsByType(Long learningSetId, LearningItemType type) {
        LearningSet set = findSetById(learningSetId);
        return set.getLearningItems().stream()
                .filter(item -> item.getType() == type)
                .map(learningItemMapper::toDto)
                .toList();
    }
}