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
import co.backend.user.User;
import co.backend.user.UserRepository;

import co.backend.userLearningSet.UserLearningSetService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@AllArgsConstructor
@Transactional
@Slf4j
public class LearningSetService {

    private final LearningSetRepository learningSetRepository;
    private final LearningSetMapper learningSetMapper;
    private final LearningItemMapper learningItemMapper;
    private final LearningItemRepository learningItemRepository;
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

        Optional<LearningSet> existingSet = learningSetRepository
                .findTopByMovieIdAndCreatorIdOrderByDateDesc(movieId, userId);

        if (existingSet.isPresent()) {
            LearningSet existing = existingSet.get();
            log.info("[BACKEND] Found existing user set, reusing: {}", existing.getId());
            return learningSetMapper.toDto(existing);
        }

        return generateNewSet(movie, user);
    }

    private LearningSetDto generateNewSet(Movie movie, User user) {
        log.info("[BACKEND] Generating new learning set...");

        learningSetRepository.deleteByMovieIdAndCreatorId(movie.getId(), user.getId());

        if (movie.getScript() == null || movie.getScript().length == 0) {
            throw new BadRequestException("Movie script was deleted after approval. Please re-add the movie to change language level or interests.");
        }

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


    public Optional<LearningSetDto> getLatestByUserAndMovie(Long userId, Long movieId) {
        return learningSetRepository.findTopByMovieIdAndCreatorIdOrderByDateDesc(movieId, userId)
                .map(learningSetMapper::toDto);
    }


    public LearningSetDto getById(Long id, Long userId) {
        LearningSet set = findSetById(id);
        validateOwnership(set, userId);
        return learningSetMapper.toDto(set);
    }

    public void updateStatus(Long id, LearningSetStatus status, Long userId) {
        LearningSet set = findSetById(id);
        validateOwnership(set, userId);
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