package co.backend.learningSet;

import co.backend.ai.OpenAiService;
import co.backend.ai.ScriptParser;
import co.backend.exceptions.BadRequestException;
import co.backend.exceptions.NotFoundException;
import co.backend.learningItem.LearningItem;
import co.backend.learningItem.LearningItemDto;
import co.backend.learningItem.LearningItemMapper;
import co.backend.learningItem.LearningItemRepository;
import co.backend.learningItem.LearningItemType;
import co.backend.movie.Movie;
import co.backend.movie.MovieRepository;
import co.backend.user.EnglishLevel;
import co.backend.user.User;
import co.backend.user.UserRepository;

import co.backend.userLearningSet.UserLearningSetService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
    private final OpenAiService openAiService;
    private final ScriptParser scriptParser;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final UserLearningSetService userLearningSetService;

    public LearningSetDto generateForUser(Long movieId, Long userId) {
        log.info("[BACKEND] generateForUser called - movieId: {}, userId: {}", movieId, userId);

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new NotFoundException("Movie not found: " + movieId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        log.debug("User level: {}, interests: {}", user.getEnglishLevel(), user.getInterests());

        Optional<LearningSetDto> reusedSet = findReusedSet(movie, user);
        return reusedSet.orElseGet(() -> generateNewSet(movie, user));

    }

    private Optional<LearningSetDto> findReusedSet(Movie movie, User user) {
        if (user.getEnglishLevel() != null) {
            log.info("Looking for user's existing set with same level...");
            Optional<LearningSetDto> existingSet = getLatestByUserAndMovieWithLevel(user.getId(), movie.getId(),
                    user.getEnglishLevel());
            if (existingSet.isPresent()) {
                String userInterests = user.getInterests();
                String existingInterests = existingSet.get().getInterests();

                boolean interestsMatch = interestsMatch(userInterests, existingInterests);

                log.debug("User interests: '{}', Existing interests: '{}', Match: {}", userInterests, existingInterests,
                        interestsMatch);

                if (interestsMatch) {
                    log.info("[BACKEND] Found matching user set, reusing: {}", existingSet.get().getId());
                    return existingSet;
                } else {
                    log.info("User has set with same level but different interests, will see if a shared one exists");
                }
            } else {
                log.info("No existing user set found with same level");
            }
        }

        if (user.getEnglishLevel() != null && user.getInterests() != null) {
            log.info("Looking for suitable shared set...");
            Optional<LearningSet> suitableSet = findSuitableSetEntity(movie.getId(), user.getEnglishLevel(),
                    user.getInterests());
            if (suitableSet.isPresent()) {
                log.info("[BACKEND] Found suitable shared set, cloning for user: {}", suitableSet.get().getId());
                learningSetRepository.deleteByMovieIdAndCreatorId(movie.getId(), user.getId());
                LearningSet clonedSet = cloneSetForUser(suitableSet.get(), user.getId());
                return Optional.of(learningSetMapper.toDto(clonedSet));
            } else {
                log.info("No suitable shared set found");
            }
        }

        return Optional.empty();
    }

    private LearningSetDto generateNewSet(Movie movie, User user) {
        log.info("[BACKEND] Generating new learning set...");

        learningSetRepository.deleteByMovieIdAndCreatorId(movie.getId(), user.getId());

        List<LearningItemDto> generatedItems = openAiService.generateFlashcards(
                movie.getTitle(),
                scriptParser.parse(movie.getScript()),
                user.getInterests(),
                user.getEnglishLevel() != null ? user.getEnglishLevel().name() : "B1");

        LearningSet set = createNewLearningSetEntity(movie, user);
        LearningSet savedSet = learningSetRepository.save(set);
        addItemsToSet(savedSet, generatedItems);

        userLearningSetService.getOrCreate(user.getId(), savedSet.getId());

        log.info("[BACKEND] Generated new learning set: {} with {} items", savedSet.getId(), generatedItems.size());
        return learningSetMapper.toDto(savedSet);
    }

    private LearningSet createNewLearningSetEntity(Movie movie, User user) {
        LearningSet set = new LearningSet();
        set.setMovie(movie);
        set.setDate(LocalDateTime.now());
        set.setName("AI Set for " + movie.getTitle());
        set.setCreatorId(user.getId());
        set.setStatus(LearningSetStatus.REVIEW);
        set.setEnglishLevel(user.getEnglishLevel());
        set.setInterests(user.getInterests());
        return set;
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
                                                                     EnglishLevel level) {
        return learningSetRepository.findTopByMovieIdAndCreatorIdAndEnglishLevelOrderByDateDesc(movieId, userId, level)
                .map(learningSetMapper::toDto);
    }

    public Optional<LearningSet> findSuitableSetEntity(Long movieId, EnglishLevel level,
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

        List<LearningItem> clonedItems = originalSet.getLearningItems().stream()
                .map(item -> {
                    LearningItem newItem = new LearningItem();
                    newItem.setType(item.getType());
                    newItem.setText(item.getText());
                    newItem.setTranslation(item.getTranslation());
                    newItem.setExampleSentence(item.getExampleSentence());
                    newItem.setTranscription(item.getTranscription());
                    newItem.setCorrectAnswerIndex(item.getCorrectAnswerIndex());
                    newItem.setLearningSet(savedSet);
                    if (item.getAnswers() != null) {
                        newItem.setAnswers(new ArrayList<>(item.getAnswers()));
                    }
                    return newItem;
                })
                .toList();

        savedSet.setLearningItems(new ArrayList<>(clonedItems));
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

        Set<String> userSet = Arrays.stream(userInterestsArray)
                .map(String::trim)
                .filter(trim -> !trim.isEmpty())
                .collect(Collectors.toSet());

        Set<String> existingSet = Arrays.stream(existingInterestsArray)
                .map(String::trim)
                .filter(trim -> !trim.isEmpty())
                .collect(Collectors.toSet());

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

    public List<LearningItemDto> getFlashCardsByLearningSetId(Long learningSetId, Long userId) {
        LearningSet set = findSetById(learningSetId);
        validateOwnership(set, userId);
        return getDtosByType(learningSetId, LearningItemType.FLASH_CARD);
    }

    public List<LearningItemDto> getTestItemsByLearningSetId(Long learningSetId, Long userId) {
        LearningSet set = findSetById(learningSetId);
        validateOwnership(set, userId);

        List<LearningItem> existingTests = getEntitiesByType(set, LearningItemType.TEST);
        List<LearningItem> flashcards = getEntitiesByType(set, LearningItemType.FLASH_CARD);

        if (existingTests.isEmpty()) {
            log.info("No tests found, generating new ones for learning set: {}", learningSetId);
            return generateTestsForSet(learningSetId);
        }

        if (flashcards.isEmpty()) {
            log.warn("No flashcards found, returning empty tests for learning set: {}", learningSetId);
            return mapToDtoList(existingTests);
        }

        if (areTestsOutdated(flashcards, existingTests)) {
            log.info("Flashcards updated after tests, regenerating tests for learning set: {}", learningSetId);
            deleteTestsForSet(learningSetId);
            return generateTestsForSet(learningSetId);
        }

        log.info("Tests are up to date, returning existing tests for learning set: {}", learningSetId);
        return mapToDtoList(existingTests);
    }

    private boolean areTestsOutdated(List<LearningItem> flashcards, List<LearningItem> existingTests) {
        LocalDateTime latestFlashcardUpdate = getLatestFlashcardUpdateTime(flashcards);
        LocalDateTime latestTestCreation = getLatestTestCreationTime(existingTests);

        log.debug("Latest flashcard update: {}, Latest test creation: {}", latestFlashcardUpdate, latestTestCreation);
        return latestFlashcardUpdate != null && latestTestCreation != null
                && latestFlashcardUpdate.isAfter(latestTestCreation);
    }

    private LocalDateTime getLatestFlashcardUpdateTime(List<LearningItem> flashcards) {
        return flashcards.stream()
                .map(flashcard -> flashcard.getUpdatedAt() != null ? flashcard.getUpdatedAt()
                        : flashcard.getCreatedAt())
                .max(Comparator.naturalOrder())
                .orElse(null);
    }

    private LocalDateTime getLatestTestCreationTime(List<LearningItem> tests) {
        return tests.stream()
                .map(LearningItem::getCreatedAt)
                .max(Comparator.naturalOrder())
                .orElse(null);
    }

    private List<LearningItemDto> mapToDtoList(List<LearningItem> items) {
        return items.stream().map(learningItemMapper::toDto).toList();
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
        return addItemsToSet(set, generatedTestsDto);
    }

    private LearningSet findSetById(Long id) {
        if (id == null) {
            throw new BadRequestException("Id must be provided");
        }
        return learningSetRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Learning set not found: " + id));
    }

    private void validateOwnership(LearningSet set, Long userId) {
        if (set.getCreatorId() != null && !set.getCreatorId().equals(userId)) {
            throw new co.backend.exceptions.ForbiddenException(
                    "You do not have permission to access this learning set.");
        }
    }

    private List<LearningItemDto> addItemsToSet(LearningSet set, List<LearningItemDto> dtos) {
        List<LearningItem> items = dtos.stream()
                .map(dto -> {
                    LearningItem item = learningItemMapper.toEntity(dto);
                    item.setLearningSet(set);
                    return item;
                })
                .toList();
        List<LearningItem> savedItems = learningItemRepository.saveAll(items);
        set.getLearningItems().addAll(savedItems);
        learningSetRepository.save(set);
        return savedItems.stream().map(learningItemMapper::toDto).toList();
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