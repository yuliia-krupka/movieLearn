import React from 'react';
import type {FlashCardData, ItemStatusDto} from '../../types/learningSet';
import MainLayout from '../layout/MainLayout';
import '../css/Results.css';

interface ResultsPageProps {
    flashcards: FlashCardData[];
    results: Map<number, boolean>;
    learningSetName: string;
    onTryAgain: () => void;
    itemStatuses: ItemStatusDto[];
    onGoToTest?: () => void;
    onBackToMovie?: () => void;
    onBackToFlashcards?: () => void;
    onGoToRefine?: () => void;
    showStatus?: boolean;
    isTestDisabled?: boolean;
    isTestResult?: boolean;
}


function getMotivationalMessage(score: number, total: number): string {
    const pct = total > 0 ? score / total : 0;
    if (pct === 1) return 'Perfect! You nailed every single word!';
    if (pct >= 0.8) return 'Great job! You know most of the words!';
    if (pct >= 0.5) return 'Your result is quite good. Try better next time!';
    if (pct >= 0.3) return 'Keep practicing — you\'re getting there!';
    return 'Don\'t give up! Practice makes perfect.';
}

function getStatusLabel(status: string): string {
    return status === 'LEARNED' ? 'Learned' : 'In progress';
}

function getStatusClass(status: string): string {
    return status === 'LEARNED' ? 'status-learned' : 'status-in-progress';
}

const ResultsPage: React.FC<ResultsPageProps> = ({
                                                     flashcards,
                                                     results,
                                                     learningSetName,
                                                     onTryAgain,
                                                     itemStatuses,
                                                     onGoToTest,
                                                     onBackToMovie,
                                                     onBackToFlashcards,
                                                     onGoToRefine,
                                                     showStatus = true,
                                                     isTestDisabled = false,
                                                     isTestResult = false
                                                 }) => {
    const total = flashcards.length;
    const score = Array.from(results.values()).filter(Boolean).length;

    const statusMap = new Map(itemStatuses.map(s => [s.learningItemId, s.status]));

    return (
        <MainLayout className="results-content" contentStyle={{height: 'calc(100vh - 64px)', overflow: 'hidden'}}>
            <div className="results-container">
                <div className="results-header">
                    {onBackToMovie && (
                        <button className="results-back-btn" onClick={onBackToMovie}>
                            ← Back to Movie
                        </button>
                    )}
                    <div>
                        <p className="results-score">{score}/{total}</p>
                        <p className="results-message">{getMotivationalMessage(score, total)}</p>
                    </div>
                    <div className="results-actions-row">
                        <button className="results-try-again" onClick={onTryAgain}>
                            Try again
                        </button>
                        {onGoToTest && !isTestDisabled && (
                            <button className="results-go-to-test" onClick={onGoToTest}>
                                Take Vocabulary Test →
                            </button>
                        )}

                        {onBackToFlashcards && (
                            <button className="results-back-flashcards" onClick={onBackToFlashcards}>
                                ← Back to Flashcards
                            </button>
                        )}
                    </div>
                </div>

                <p className="results-movie-title">
                    "{learningSetName}"
                    {onGoToRefine && (
                        <button className="results-title-refine-btn" onClick={onGoToRefine}>
                            Refine Flashcards
                        </button>
                    )}
                </p>

                <div className="results-list">
                    {flashcards.map((card, index) => {
                        const known = results.get(index) ?? false;
                        const itemStatus = statusMap.get(card.id) || 'NOT_STARTED';
                        return (
                            <div key={card.id} className={`result-card ${known ? 'correct' : 'incorrect'}`}>
                                <span className={`result-icon ${known ? 'correct' : 'incorrect'}`}>
                                    {known ? '✓' : '✗'}
                                </span>
                                <div className="result-card-content">
                                    <span className="result-word">{card.word}</span>

                                    {!isTestResult && (
                                        <>
                                            {card.transcription && (
                                                <span className="result-transcription">{card.transcription}</span>
                                            )}
                                            {card.exampleSentence && (
                                                <span className="result-sentence">"{card.exampleSentence}"</span>
                                            )}
                                        </>
                                    )}
                                    <span className="result-translation">{card.translation}</span>
                                </div>
                                {showStatus && (
                                    <span className={`result-status-badge ${getStatusClass(itemStatus)}`}>
                                        {getStatusLabel(itemStatus)}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </MainLayout>
    );
};

export default ResultsPage;
