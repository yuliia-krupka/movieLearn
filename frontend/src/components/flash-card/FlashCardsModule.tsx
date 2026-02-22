import React, { useState, useEffect } from 'react';
import FlashCard from './FlashCard';
import ResultsPage from './ResultsPage';
import MainLayout from "../layout/MainLayout.tsx";
import '../css/Layout.css';
import { learningSetService } from '../../services/learningSetService';
import type { FlashCardData, LearningSetDto, ItemStatusDto } from '../../types/learningSet';
import { useAuth } from '../auth/useAuth';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

interface FlashCardsModuleProps {
    movieId?: number;
    learningSetId?: number;
}

const FlashCardsModule: React.FC<FlashCardsModuleProps> = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUserId } = useAuth();
    const { id } = useParams<{ id: string }>();
    const stateMovieId = location.state?.movieId;
    const movieId = props.movieId || stateMovieId;
    const learningSetId = props.learningSetId || (id ? Number(id) : undefined);
    const [flashcards, setFlashcards] = useState<FlashCardData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [learningSet, setLearningSet] = useState<LearningSetDto | null>(null);

    const [results, setResults] = useState<Map<number, boolean>>(new Map());
    const [showResults, setShowResults] = useState(false);
    const [itemStatuses, setItemStatuses] = useState<ItemStatusDto[]>([]);

    const allReviewed = results.size === flashcards.length && flashcards.length > 0;

    useEffect(() => {
        const loadFlashcards = async () => {
            try {
                setLoading(true);
                setError(null);

                let learningSetData: LearningSetDto;

                if (learningSetId) {
                    // Use the provided learning set ID
                    learningSetData = await learningSetService.getById(learningSetId);
                } else {
                    // Fallback to movie-based logic
                    const targetMovieId = movieId || 1;
                    learningSetData = await learningSetService.getOrCreateByMovie(targetMovieId);
                }

                setLearningSet(learningSetData);
                const flashcardData = await learningSetService.getFlashCards(learningSetData.id);
                setFlashcards(flashcardData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load flashcards');
            } finally {
                setLoading(false);
            }
        };

        void loadFlashcards();
    }, [movieId, learningSetId]);

    const currentCard = flashcards[currentIndex];

    const handlePrevious = () => setCurrentIndex(prev => (prev > 0 ? prev - 1 : flashcards.length - 1));
    const handleNext = () => setCurrentIndex(prev => (prev < flashcards.length - 1 ? prev + 1 : 0));

    const handleKnow = () => {
        setResults(prev => new Map(prev).set(currentIndex, true));
        if (currentIndex < flashcards.length - 1) {
            handleNext();
        }
    };

    const handleDontKnow = () => {
        setResults(prev => new Map(prev).set(currentIndex, false));
        if (currentIndex < flashcards.length - 1) {
            handleNext();
        }
    };

    const handleSeeResults = () => {
        setShowResults(true);

        if (currentUserId && learningSet) {
            const correctCount = Array.from(results.values()).filter(Boolean).length;
            const score = Math.round((correctCount / flashcards.length) * 100);

            learningSetService.completeFlashcards(currentUserId, learningSet.id, score)
                .catch(err => console.error('Failed to complete flashcards:', err));

            const answerPromises = Array.from(results.entries()).map(([index, correct]) => {
                const card = flashcards[index];
                if (card) {
                    return learningSetService.recordAnswer(currentUserId, card.id, correct);
                }
                return Promise.resolve();
            });

            Promise.all(answerPromises)
                .then(() => learningSetService.getItemStatuses(currentUserId, learningSet.id))
                .then(statuses => setItemStatuses(statuses))
                .catch(err => console.error('Failed to save answers:', err));
        }
    };

    const handleTryAgain = () => {
        setResults(new Map());
        setCurrentIndex(0);
        setShowResults(false);
    };

    const handleGoToTest = () => {
        if (learningSetId) {
            navigate(`/learning-sets/${learningSetId}/tests`);
        } else {
            navigate('/tests', { state: { movieId: movieId || learningSet?.movieId } });
        }
    };

    const handleBackToMovie = () => {
        const mid = movieId || learningSet?.movieId;
        if (mid) {
            navigate(`/movies/${mid}`);
        } else {
            navigate('/movies');
        }
    };

    const handleGoToRefine = () => {
        if (learningSetId) {
            navigate(`/learning-sets/${learningSetId}/update`);
        } else if (learningSet) {
            navigate(`/learning-sets/${learningSet.id}/update`);
        }
    };

    if (loading) {
        return (
            <MainLayout className="flashcard-content">
                <div className="loading">Loading flashcards...</div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout className="flashcard-content">
                <div className="error">Error: {error}</div>
            </MainLayout>
        );
    }

    if (flashcards.length === 0) {
        return (
            <MainLayout className="flashcard-content">
                <div className="no-data">No flashcards available</div>
            </MainLayout>
        );
    }

    if (showResults) {
        const allLearned = flashcards.length > 0 && flashcards.every(card => {
            const status = itemStatuses.find(s => s.learningItemId === card.id);
            return status?.status === 'LEARNED' || status?.status === 'SKIPPED';
        });

        return (
            <ResultsPage
                flashcards={flashcards}
                results={results}
                learningSetName={learningSet?.name || 'Learning Set'}
                onTryAgain={handleTryAgain}
                itemStatuses={itemStatuses}
                onGoToTest={handleGoToTest}
                onGoToRefine={handleGoToRefine}
                isTestDisabled={!allLearned}
                onBackToMovie={handleBackToMovie}
            />
        );
    }

    return (
        <MainLayout className="flashcard-content">
            {learningSet && (
                <div className="learning-set-info">
                    <h2>{learningSet.name}</h2>
                </div>
            )}

            <FlashCard
                word={currentCard.word}
                translation={currentCard.translation}
                exampleSentence={currentCard.exampleSentence}
                transcription={currentCard.transcription}
                status={results.get(currentIndex)}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onKnow={handleKnow}
                onDontKnow={handleDontKnow}
                hasPrevious={currentIndex > 0}
                hasNext={currentIndex < flashcards.length - 1}
                allReviewed={allReviewed}
                onSeeResults={handleSeeResults}
                completionHint={
                    (currentIndex === flashcards.length - 1 && !allReviewed)
                        ? "Finish all flash cards to see result"
                        : undefined
                }
            />

            <div className="flashcard-counter">
                {currentIndex + 1} / {flashcards.length}
            </div>
        </MainLayout>
    );
};

export default FlashCardsModule;
