import React, {useState, useEffect} from 'react';
import TestCard from './TestCard';
import ResultsPage from '../flash-card/ResultsPage';
import MainLayout from '../layout/MainLayout';
import {Spin, Result, Button} from 'antd';
import '../css/Layout.css';
import '../css/Test.css';
import '../css/MovieDetails.css';
import {learningSetService} from '../../services/learningSetService';
import type {TestItemData, LearningSetDto, ItemStatusDto} from '../../types/learningSet';
import {useAuth} from '../auth/useAuth';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {shuffleAnswers} from '../../utils/testUtils';

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
    const [isGenerating, setIsGenerating] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isGeneratingTests, setIsGeneratingTests] = useState(false);

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
                    setIsChecking(true);
                    const interestsStr = Array.isArray(user?.interests) ? user.interests.join(',') : user?.interests;
                    const userLearningSet = await learningSetService.getLatestByUserAndMovie(
                        Number(id),
                        user?.englishLevel,
                        interestsStr
                    );

                    if (userLearningSet) {
                        learningSetData = userLearningSet;
                        setIsChecking(false);
                    } else {
                        console.log('Starting test generation...');
                        setIsGenerating(true);
                        learningSetData = await learningSetService.getOrCreateByMovie(Number(movieId));
                        console.log('Test generation completed');
                        setIsGenerating(false);
                        setIsChecking(false);
                    }
                }

                setLearningSet(learningSetData);

                const generateTimeout = setTimeout(() => setIsGeneratingTests(true), 500);

                const items = currentUserId
                    ? await learningSetService.getTestItems(learningSetData.id)
                    : [];

                clearTimeout(generateTimeout);
                setIsGeneratingTests(false);

                console.log('Retrieved test items:', items.length);

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
            const bulkAnswers: { learningItemId: number, correct: boolean }[] = [];

            Array.from(answers.entries()).forEach(([index, selectedAnswer]) => {
                const item = testItems[index];
                if (item && selectedAnswer !== null) {
                    const correct = selectedAnswer === item.correctAnswerIndex;
                    bulkAnswers.push({learningItemId: item.id, correct});
                }
            });

            const answersPromise = bulkAnswers.length > 0
                ? learningSetService.recordAnswersBulk(bulkAnswers)
                : Promise.resolve();

            const correctCount = bulkAnswers.filter(a => a.correct).length;
            const score = Math.round((correctCount / testItems.length) * 100);

            const completionPromise = learningSetService.completeTests(learningSet.id, score);

            Promise.all([answersPromise, completionPromise])
                .then(() => learningSetService.getItemStatuses(learningSet.id))
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
            <MainLayout className="flashcard-content" fullHeight>
                <div className="generating-overlay">
                    <div className="generating-content">
                        {isGenerating || isGeneratingTests ? (
                            <>
                                <img
                                    src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM21td2NsNGkybmhyZWVzcm52N2g2bXd0d3JoY3J5Zm5jNHZtNXI4cCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/XnjBmkLXUPJQwJW4pp/giphy.gif"
                                    alt="Generating new content..."
                                    className="generating-gif"
                                />
                                <h2 className="generating-title">Preparing Tests...</h2>
                                <p className="generating-text">
                                    This may take a moment if items were recently updated.
                                </p>
                            </>
                        ) : (
                            <>
                                <Spin size="large"/>
                                <h2 className="generating-title">Loading Tests...</h2>
                                <p className="generating-text">
                                    Fetching your questions.
                                </p>
                            </>
                        )}
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
        <MainLayout className="flashcard-content" fullHeight>
            {(isGenerating || isChecking) && !loading && (
                <div className="generating-overlay">
                    <div className="generating-content">
                        {isGenerating ? (
                            <>
                                <img
                                    src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM21td2NsNGkybmhyZWVzcm52N2g2bXd0d3JoY3J5Zm5jNHZtNXI4cCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/XnjBmkLXUPJQwJW4pp/giphy.gif"
                                    alt="Generating new content..."
                                    className="generating-gif"
                                />
                                <h2 className="generating-title">Generating Magic...</h2>
                                <p className="generating-text">
                                    Creating personalized tests based on the movie script.
                                </p>
                            </>
                        ) : (
                            <>
                                <Spin size="large"/>
                                <h2 className="generating-title">Checking...</h2>
                                <p className="generating-text">
                                    Looking for existing learning sets...
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

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
