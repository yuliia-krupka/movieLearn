package co.backend.learningSet;

import co.backend.ai.dto.AiContext;
import co.backend.exceptions.BadRequestException;
import co.backend.exceptions.NotFoundException;
import co.backend.learningItem.LearningItem;
import co.backend.learningItem.LearningItemDto;
import co.backend.learningItem.LearningItemMapper;
import co.backend.learningItem.LearningItemRepository;
import co.backend.learningItem.LearningItemType;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Transactional
@Slf4j
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
        log.info("[BACKEND] generateForUser called - movieId: {}, userId: {}", movieId, userId);

        co.backend.movie.Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new NotFoundException("Movie not found: " + movieId));

        co.backend.user.User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        log.debug("User level: {}, interests: {}", user.getEnglishLevel(), user.getInterests());

        if (user.getEnglishLevel() != null && user.getInterests() != null) {
            log.info("Looking for suitable shared set...");
            Optional<LearningSet> suitableSet = findSuitableSetEntity(movieId, user.getEnglishLevel(),
                    user.getInterests());
            if (suitableSet.isPresent()) {
                log.info("[BACKEND] Found suitable shared set, cloning for user: {}", suitableSet.get().getId());
                LearningSet clonedSet = cloneSetForUser(suitableSet.get(), userId);
                return learningSetMapper.toDto(clonedSet);
            } else {
                log.info("No suitable shared set found");
            }
        }

        if (user.getEnglishLevel() != null) {
            log.info("Looking for user's existing set with same level...");
            Optional<LearningSetDto> existingSet = getLatestByUserAndMovieWithLevel(userId, movieId,
                    user.getEnglishLevel());
            if (existingSet.isPresent()) {
                String userInterests = user.getInterests();
                String existingInterests = existingSet.get().getInterests();

                boolean interestsMatch = interestsMatch(userInterests, existingInterests);

                log.debug("User interests: '{}', Existing interests: '{}', Match: {}", userInterests, existingInterests,
                        interestsMatch);

                if (interestsMatch) {
                    log.info("[BACKEND] Found matching user set, reusing: {}", existingSet.get().getId());
                    return existingSet.get();
                } else {
                    log.info("User has set with same level but different interests, will generate new");
                }
            } else {
                log.info("No existing user set found with same level");
            }
        }

        log.info("[BACKEND] Generating new learning set...");

        learningSetRepository.deleteByMovieIdAndCreatorId(movieId, userId);

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

        log.info("[BACKEND] Generated new learning set: {} with {} items", savedSet.getId(), generatedItems.size());
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
        return findSuitableSetEntity(movieId, level, interests)
                .map(learningSetMapper::toDto);
    }

    public Optional<LearningSet> findSuitableSetEntity(Long movieId, co.backend.user.EnglishLevel level,
                                                       String interests) {
        log.info("[BACKEND] findSuitableSetEntity called - movieId: {}, level: {}, interests: {}", movieId, level,
                interests);

        Optional<LearningSet> exactMatch = learningSetRepository
                .findTopByMovieIdAndEnglishLevelAndInterestsOrderByDateDesc(movieId, level, interests);

        if (exactMatch.isPresent()) {
            log.info("[BACKEND] Found exact match: {}", exactMatch.get().getId());
            return exactMatch;
        }

        List<LearningSet> candidateSets = learningSetRepository
                .findByMovieIdAndEnglishLevelOrderByDateDesc(movieId, level);

        log.info("[BACKEND] Found {} candidate sets with level {}", candidateSets.size(), level);

        for (LearningSet candidate : candidateSets) {
            log.debug("[BACKEND] Checking candidate set {} with level {}", candidate.getId(),
                    candidate.getEnglishLevel());
            if (candidate.getEnglishLevel() != null && candidate.getEnglishLevel().equals(level)) {
                if (interestsMatch(interests, candidate.getInterests())) {
                    log.info("[BACKEND] Found flexible match: user interests='{}' vs existing='{}'", interests,
                            candidate.getInterests());
                    return Optional.of(candidate);
                }
            } else {
                log.debug("[BACKEND] Level mismatch - expected: {}, actual: {}", level, candidate.getEnglishLevel());
            }
        }

        log.info("[BACKEND] No suitable set found");
        return Optional.empty();
    }

    private LearningSet cloneSetForUser(LearningSet originalSet, Long newUserId) {
        LearningSet newSet = new LearningSet();
        newSet.setMovie(originalSet.getMovie());
        newSet.setDate(LocalDateTime.now());
        newSet.setName(originalSet.getName());
        newSet.setCreatorId(newUserId);
        newSet.setStatus(LearningSetStatus.REVIEW);
        newSet.setEnglishLevel(originalSet.getEnglishLevel());
        newSet.setInterests(originalSet.getInterests());

        LearningSet savedSet = learningSetRepository.save(newSet);

        List<co.backend.learningItem.LearningItem> clonedItems = originalSet.getLearningItems().stream()
                .map(item -> {
                    co.backend.learningItem.LearningItem newItem = new co.backend.learningItem.LearningItem();
                    newItem.setType(item.getType());
                    newItem.setText(item.getText());
                    newItem.setTranslation(item.getTranslation());
                    newItem.setExampleSentence(item.getExampleSentence());
                    newItem.setTranscription(item.getTranscription());
                    newItem.setCorrectAnswerIndex(item.getCorrectAnswerIndex());
                    newItem.setLearningSet(savedSet);
                    if (item.getAnswers() != null) {
                        newItem.setAnswers(new java.util.ArrayList<>(item.getAnswers()));
                    }
                    return newItem;
                })
                .toList();

        savedSet.setLearningItems(new java.util.ArrayList<>(clonedItems));
        learningSetRepository.save(savedSet);

        userLearningSetService.getOrCreate(newUserId, savedSet.getId());
        return savedSet;
    }

    private boolean interestsMatch(String userInterests, String existingInterests) {
        if (userInterests == null && existingInterests == null)
            return true;
        if (userInterests == null || existingInterests == null)
            return false;

        String[] userInterestsArray = userInterests.toLowerCase().split("[,\\s]+");
        String[] existingInterestsArray = existingInterests.toLowerCase().split("[,\\s]+");

        java.util.Set<String> userSet = java.util.Arrays.stream(userInterestsArray)
                .map(String::trim)
                .filter(trim -> !trim.isEmpty())
                .collect(java.util.stream.Collectors.toSet());

        java.util.Set<String> existingSet = java.util.Arrays.stream(existingInterestsArray)
                .map(String::trim)
                .filter(trim -> !trim.isEmpty())
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
                log.error("Could not delete empty set {}: {}", potentialSet.getId(), e.getMessage());
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

        AiContext context = openAiService.extractAiContext(set);

        LearningItemDto currentDto = learningItemMapper.toDto(item);
        LearningItemDto updatedDto = openAiService.regenerateItem(currentDto, instructions,
                context.movieTitle(), context.movieDescription(), context.scriptContent(),
                context.englishLevel(), context.interests());

        item.setText(updatedDto.getText());
        item.setTranslation(updatedDto.getTranslation());
        item.setTranscription(updatedDto.getTranscription());
        item.setExampleSentence(updatedDto.getExampleSentence());

        learningSetRepository.save(set);

        return learningItemMapper.toDto(item);
    }

    public List<LearningItemDto> getFlashCardsByLearningSetId(Long learningSetId) {
        return getDtosByType(learningSetId, LearningItemType.FLASH_CARD);
    }

    public List<LearningItemDto> getTestItemsByLearningSetId(Long learningSetId) {
        LearningSet set = findSetById(learningSetId);

        List<LearningItem> existingTests = getEntitiesByType(set, LearningItemType.TEST);
        List<LearningItem> flashcards = getEntitiesByType(set, LearningItemType.FLASH_CARD);

        if (existingTests.isEmpty()) {
            log.info("No tests found, generating new ones for learning set: {}", learningSetId);
            return generateTestsForSet(learningSetId);
        }

        if (flashcards.isEmpty()) {
            log.warn("No flashcards found, returning empty tests for learning set: {}", learningSetId);
            return existingTests.stream().map(learningItemMapper::toDto).toList();
        }

        LocalDateTime latestFlashcardUpdate = flashcards.stream()
                .map(flashcard -> flashcard.getUpdatedAt() != null ? flashcard.getUpdatedAt()
                        : flashcard.getCreatedAt())
                .max(Comparator.naturalOrder())
                .orElse(null);

        LocalDateTime latestTestCreation = existingTests.stream()
                .map(LearningItem::getCreatedAt)
                .max(Comparator.naturalOrder())
                .orElse(null);

        if (latestFlashcardUpdate.isAfter(latestTestCreation)) {
            log.info("Flashcards updated after tests, regenerating tests for learning set: {}", learningSetId);
            log.debug("Latest flashcard update: {}, Latest test creation: {}", latestFlashcardUpdate,
                    latestTestCreation);

            deleteTestsForSet(learningSetId);
            return generateTestsForSet(learningSetId);
        }

        log.info("Tests are up to date, returning existing tests for learning set: {}", learningSetId);
        return existingTests.stream().map(learningItemMapper::toDto).toList();
    }

    private void deleteTestsForSet(Long learningSetId) {
        LearningSet set = findSetById(learningSetId);
        List<LearningItem> testsToDelete = getEntitiesByType(set, LearningItemType.TEST);

        if (!testsToDelete.isEmpty()) {
            log.info("Deleting {} existing tests for learning set: {}", testsToDelete.size(), learningSetId);
            learningItemRepository.deleteAll(testsToDelete);
            set.getLearningItems().removeAll(testsToDelete);
            learningSetRepository.save(set);
        }
    }

    public List<LearningItemDto> generateTestsForSet(Long learningSetId) {
        LearningSet set = findSetById(learningSetId);

        List<LearningItemDto> existingTests = getEntitiesByType(set, LearningItemType.TEST).stream()
                .map(learningItemMapper::toDto)
                .toList();

        if (!existingTests.isEmpty()) {
            return existingTests;
        }

        List<LearningItemDto> flashcards = getDtosByType(learningSetId, LearningItemType.FLASH_CARD);

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

    private List<LearningItem> getEntitiesByType(LearningSet set, LearningItemType type) {
        return set.getLearningItems().stream()
                .filter(item -> item.getType() == type)
                .toList();
    }

    private List<LearningItemDto> getDtosByType(Long learningSetId, LearningItemType type) {
        return getEntitiesByType(findSetById(learningSetId), type).stream()
                .map(learningItemMapper::toDto)
                .toList();
    }
}