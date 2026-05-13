import React, {useState, useEffect} from 'react';
import TestCard from './TestCard';
import ResultsPage from '../flash-card/ResultsPage';
import MainLayout from '../layout/MainLayout';
import {Result, Button, Spin} from 'antd';
import '../layout/Layout.css';
import './Test.css';
import '../movie/MovieDetails.css';
import {learningSetService} from '../../services/learningSetService';
import {learningItemService} from '../../services/learningItemService';
import {progressService} from '../../services/progressService';
import type {TestItemData, LearningSetDto, ItemStatusDto} from '../../types/learningSet';
import {useAuth} from '../auth/useAuth';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {ErrorHandler} from '../err/ErrorHandler';
import {shuffleAnswers} from '../../utils/testUtils';
import learningCat from '../../assets/learning-cat.png';

const TestsModule: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {currentUserId, user} = useAuth();
    const {id} = useParams<{ id: string }>();
    const movieId = location.state?.movieId;
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
                    const userLearningSet = await learningSetService.getLatestByUserAndMovie(
                        Number(movieId)
                    );

                    if (userLearningSet) {
                        learningSetData = userLearningSet;
                    } else {
                        console.log('Starting test generation...');
                        learningSetData = await learningSetService.startLearningForUser(Number(movieId));
                        console.log('Test generation completed');
                    }
                }

                setLearningSet(learningSetData);

                const items = currentUserId
                    ? await learningItemService.getTestItems(learningSetData.id)
                    : [];

                const shuffledItems = items.map(item => {
                    const {shuffledAnswers, newCorrectIndex} = shuffleAnswers(item.answers, item.correctAnswerIndex);
                    return {
                        ...item,
                        answers: shuffledAnswers,
                        correctAnswerIndex: newCorrectIndex,
                        question: item.text
                    };
                });

                setTestItems(shuffledItems);
            } catch (err: unknown) {
                const isForbidden = ErrorHandler.isForbiddenError(err);
                const message = isForbidden
                    ? 'Access Denied: You do not have permission to access this test.'
                    : ErrorHandler.handleAxiosError(err, 'Failed to generate tests. Please try again.');
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        void loadTestItems();
    }, [id, movieId, learningSetId, currentUserId, user?.interests, user?.englishLevel]);

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
            const bulkAnswers: { learningItemId: number, correct: boolean }[] = [];

            Array.from(answers.entries()).forEach(([index, selectedAnswer]) => {
                const item = testItems[index];
                if (item && selectedAnswer !== null) {
                    const correct = selectedAnswer === item.correctAnswerIndex;
                    bulkAnswers.push({learningItemId: item.id, correct});
                }
            });

            const answersPromise = bulkAnswers.length > 0
                ? progressService.recordAnswersBulk(bulkAnswers)
                : Promise.resolve();

            const correctCount = bulkAnswers.filter(a => a.correct).length;
            const score = Math.round((correctCount / testItems.length) * 100);

            const completionPromise = progressService.completeTests(learningSet.id, score);

            Promise.all([answersPromise, completionPromise])
                .then(() => progressService.getItemStatuses(learningSet.id))
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
        const mid = movieId || learningSet?.movieId;
        if (mid) {
            navigate(`/movies/${mid}`);
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

    const handleGoToRefine = () => {
        if (learningSetId) {
            navigate(`/learning-sets/${learningSetId}/update`);
        } else if (learningSet) {
            navigate(`/learning-sets/${learningSet.id}/update`);
        } else {
            navigate('/flash-cards', {state: {movieId: movieId}});
        }
    };

    if (loading) {
        return (
            <MainLayout className="flashcard-content" fullHeight>
                <div className="generating-overlay">
                    <div className="generating-content">
                        <img
                            src={learningCat}
                            alt="Preparing Tests..."
                            className="generating-gif"
                        />
                        <h2 className="generating-title">Preparing Tests...</h2>
                        <p className="generating-text">
                            This may take a moment.
                        </p>
                        <Spin size="large" className="generating-spinner"/>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        const isForbidden = error.toLowerCase().includes('forbidden') || error.toLowerCase().includes('access denied');

        return (
            <MainLayout className="flashcard-content">
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
                    <Result
                        status={isForbidden ? "403" : "error"}
                        title={isForbidden ? "Access Denied" : "Error"}
                        subTitle={isForbidden ? "Sorry, you don't have permission to access this test." : error}
                        extra={
                            <Button type="primary" onClick={handleBackToMovie}>
                                Back to Movie
                            </Button>
                        }
                    />
                </div>
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
                learningSetName={learningSet?.movieTitle ? `AI Set for ${learningSet.movieTitle}` : (learningSet?.name || 'Test')}
                onTryAgain={handleTryAgain}
                itemStatuses={itemStatuses}
                onBackToMovie={handleBackToMovie}
                onBackToFlashcards={handleBackToFlashcards}
                onGoToRefine={handleGoToRefine}
                showStatus={false}
                isTestResult={true}
            />
        );
    }

    const currentItem = testItems[currentIndex];
    const progress = ((currentIndex + (answers.has(currentIndex) ? 1 : 0)) / testItems.length) * 100;

    return (
        <MainLayout className="flashcard-content" fullHeight>


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
