import React, {useState, useEffect} from 'react';
import TestCard from './TestCard';
import ResultsPage from '../flash-card/ResultsPage';
import MainLayout from '../layout/MainLayout';
import '../css/Layout.css';
import '../css/Test.css';
import {learningSetService} from '../../services/learningSetService';
import type {TestItemData, LearningSetDto, ItemStatusDto} from '../../types/learningSet';
import {useAuth} from '../auth/useAuth';
import {useLocation, useNavigate, useParams} from 'react-router-dom';

const TestsModule: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {currentUserId, user} = useAuth();
    const {id} = useParams<{ id: string }>();
    const movieId = location.state?.movieId || 1;
    const learningSetId = id ? Number(id) : undefined;
    const [testItems, setTestItems] = useState<TestItemData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [learningSet, setLearningSet] = useState<LearningSetDto | null>(null);

    const [answers, setAnswers] = useState<Map<number, number | null>>(new Map());
    const [showResults, setShowResults] = useState(false);
    const [itemStatuses, setItemStatuses] = useState<ItemStatusDto[]>([]);

    useEffect(() => {
        const loadTestItems = async () => {
            if (!currentUserId) return;
            try {
                setLoading(true);
                setError(null);

                let learningSetData: LearningSetDto;

                if (learningSetId) {
                    learningSetData = await learningSetService.getById(learningSetId);
                } else {
                    const interestsStr = Array.isArray(user?.interests) ? user.interests.join(',') : user?.interests;
                    const userLearningSet = await learningSetService.getLatestByUserAndMovie(
                        Number(movieId),
                        currentUserId,
                        user?.englishLevel,
                        interestsStr
                    );

                    // Fallback to legacy behavior if user set not found (shouldn't happen in normal flow)
                    if (userLearningSet) {
                        learningSetData = userLearningSet;
                    } else {
                        learningSetData = await learningSetService.getOrCreateByMovie(Number(movieId));
                    }
                }

                setLearningSet(learningSetData);

                const items = await learningSetService.getTestItems(learningSetData.id);
                console.log('Retrieved test items:', items.length);

                const shuffledItems = items.map(item => {
                    const indices = item.answers.map((_, i) => i);
                    for (let i = indices.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [indices[i], indices[j]] = [indices[j], indices[i]];
                    }
                    const shuffledAnswers = indices.map(i => item.answers[i]);
                    const newCorrectIndex = indices.indexOf(item.correctAnswerIndex);
                    return {
                        ...item,
                        answers: shuffledAnswers,
                        correctAnswerIndex: newCorrectIndex,
                        question: item.text // Add question property for TestCard
                    };
                });

                setTestItems(shuffledItems);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to load test');
            } finally {
                setLoading(false);
            }
        };

        void loadTestItems();
    }, [movieId, learningSetId, currentUserId, user?.interests, user?.englishLevel]);

    const handleSelectAnswer = (answerIndex: number) => {
        setAnswers(prev => new Map(prev).set(currentIndex, answerIndex));
    };

    const handleNext = () => {
        if (currentIndex < testItems.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleSeeResults = () => {
        setShowResults(true);

        if (currentUserId && learningSet) {
            const answerPromises = Array.from(answers.entries()).map(([index, selectedAnswer]) => {
                const item = testItems[index];
                if (item && selectedAnswer !== null) {
                    const correct = selectedAnswer === item.correctAnswerIndex;
                    return learningSetService.recordAnswer(currentUserId, item.id, correct);
                }
                return Promise.resolve();
            });

            const score = Array.from(answers.entries()).filter(([index, selectedAnswer]) => {
                const item = testItems[index];
                return item && selectedAnswer === item.correctAnswerIndex;
            }).length;

            const completionPromise = learningSetService.completeFlashcards(currentUserId, learningSet.id, score);

            Promise.all([...answerPromises, completionPromise])
                .then(() => learningSetService.getItemStatuses(currentUserId, learningSet.id))
                .then(statuses => setItemStatuses(statuses))
                .catch(() => console.error('Failed to save results'));
        }
    };

    const handleTryAgain = () => {
        setAnswers(new Map());
        setCurrentIndex(0);
        setShowResults(false);
    };

    const handleBackToMovie = () => {
        if (movieId) {
            navigate(`/movies/${movieId}`);
        } else {
            navigate('/movies');
        }
    };

    const handleBackToFlashcards = () => {
        if (learningSetId) {
            navigate(`/learning-sets/${learningSetId}/flashcards`);
        } else {
            navigate('/flash-cards', {state: {movieId: movieId}});
        }
    };

    if (loading) {
        return (
            <MainLayout className="flashcard-content">
                <div className="loading">Loading test...</div>
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

    if (testItems.length === 0) {
        return (
            <MainLayout className="flashcard-content">
                <div className="no-data">No test questions available</div>
            </MainLayout>
        );
    }

    if (showResults) {
        const flashcardData: { word: string; translation: string; id: number }[] = testItems.map(item => ({
            word: item.question || item.text,
            translation: item.answers[item.correctAnswerIndex],
            id: item.id
        }));

        const resultsMap = new Map<number, boolean>();
        answers.forEach((selectedAnswer, index) => {
            const item = testItems[index];
            if (item && selectedAnswer !== null) {
                resultsMap.set(index, selectedAnswer === item.correctAnswerIndex);
            }
        });

        return (
            <ResultsPage
                flashcards={flashcardData}
                results={resultsMap}
                learningSetName={learningSet?.name || 'Test'}
                onTryAgain={handleTryAgain}
                itemStatuses={itemStatuses}
                onBackToMovie={handleBackToMovie}
                onBackToFlashcards={handleBackToFlashcards}
                showStatus={false}
                isTestResult={true}
            />
        );
    }

    const currentItem = testItems[currentIndex];
    const progress = ((currentIndex + (answers.has(currentIndex) ? 1 : 0)) / testItems.length) * 100;

    return (
        <MainLayout className="flashcard-content">
            {learningSet && (
                <div className="learning-set-info">
                    <h2>{learningSet.name}</h2>
                </div>
            )}

            <div className="test-progress">
                <div className="test-progress-fill" style={{width: `${progress}%`}}/>
            </div>

            <TestCard
                question={currentItem.question || currentItem.text}
                answers={currentItem.answers}
                correctAnswerIndex={currentItem.correctAnswerIndex}
                selectedAnswer={answers.get(currentIndex) ?? null}
                onSelectAnswer={handleSelectAnswer}
                onNext={handleNext}
                hasNext={currentIndex < testItems.length - 1}
                onSeeResults={handleSeeResults}
                isLast={currentIndex === testItems.length - 1}
            />

            <div className="test-counter">
                Question {currentIndex + 1} / {testItems.length}
            </div>
        </MainLayout>
    );
};

export default TestsModule;
