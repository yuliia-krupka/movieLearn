import React, {useState, useEffect} from 'react';
import FlashCard from './FlashCard';
import ResultsPage from './ResultsPage';
import MainLayout from "../layout/MainLayout.tsx";
import '../css/Layout.css';
import {type FlashCardData, type LearningSetDto, learningSetService} from '../../services/learningSetService';

import {useLocation} from 'react-router-dom';

interface FlashCardsModuleProps {
    movieId?: number;
    learningSetId?: number;
}

const FlashCardsModule: React.FC<FlashCardsModuleProps> = (props) => {
    const location = useLocation();
    const stateMovieId = location.state?.movieId;
    const movieId = props.movieId || stateMovieId;
    const learningSetId = props.learningSetId;
    const [flashcards, setFlashcards] = useState<FlashCardData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [learningSet, setLearningSet] = useState<LearningSetDto | null>(null);

    // Results tracking
    const [results, setResults] = useState<Map<number, boolean>>(new Map());
    const [showResults, setShowResults] = useState(false);

    const allReviewed = results.size === flashcards.length && flashcards.length > 0;

    useEffect(() => {
        const loadFlashcards = async () => {
            try {
                setLoading(true);
                setError(null);

                let learningSetData: LearningSetDto | null = null;

                if (learningSetId) {
                    learningSetData = await learningSetService.getLearningSet(learningSetId);
                } else if (movieId) {
                    learningSetData = await learningSetService.getLatestLearningSetByMovie(movieId);
                    if (!learningSetData) {
                        learningSetData = await learningSetService.generateLearningSet(movieId);
                    }
                } else {
                    learningSetData = await learningSetService.getLatestLearningSetByMovie(1);
                    if (!learningSetData) {
                        learningSetData = await learningSetService.generateLearningSet(1);
                    }
                }

                setLearningSet(learningSetData);
                const flashcardData = learningSetService.extractFlashCards(learningSetData);
                setFlashcards(flashcardData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load flashcards');
            } finally {
                setLoading(false);
            }
        };

        loadFlashcards();
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

    const handleTryAgain = () => {
        setResults(new Map());
        setCurrentIndex(0);
        setShowResults(false);
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

    // Show results page
    if (showResults) {
        return (
            <ResultsPage
                flashcards={flashcards}
                results={results}
                learningSetName={learningSet?.name || 'Learning Set'}
                onTryAgain={handleTryAgain}
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
                onPrevious={handlePrevious}
                onNext={handleNext}
                onKnow={handleKnow}
                onDontKnow={handleDontKnow}
                hasPrevious={currentIndex > 0}
                hasNext={currentIndex < flashcards.length - 1}
                allReviewed={allReviewed}
                onSeeResults={() => setShowResults(true)}
            />

            <div className="flashcard-counter">
                {currentIndex + 1} / {flashcards.length}
            </div>
        </MainLayout>
    );
};

export default FlashCardsModule;
