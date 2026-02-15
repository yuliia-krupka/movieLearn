import React from 'react';
import type {FlashCardData} from '../../services/learningSetService';
import MainLayout from '../layout/MainLayout';
import '../css/Results.css';

interface ResultsPageProps {
    flashcards: FlashCardData[];
    results: Map<number, boolean>;
    learningSetName: string;
    onTryAgain: () => void;
}

function getMotivationalMessage(score: number, total: number): string {
    const pct = total > 0 ? score / total : 0;
    if (pct === 1) return 'Perfect! You nailed every single word!';
    if (pct >= 0.8) return 'Great job! You know most of the words!';
    if (pct >= 0.5) return 'Your result is quite good. Try better next time!';
    if (pct >= 0.3) return 'Keep practicing — you\'re getting there!';
    return 'Don\'t give up! Practice makes perfect.';
}

const ResultsPage: React.FC<ResultsPageProps> = ({flashcards, results, learningSetName, onTryAgain}) => {
    const total = flashcards.length;
    const score = Array.from(results.values()).filter(Boolean).length;

    return (
        <MainLayout className="results-content" contentStyle={{height: 'calc(100vh - 64px)', overflow: 'hidden'}}>
            <div className="results-container">
                {/* Header */}
                <div className="results-header">
                    <div>
                        <p className="results-score">{score}/{total}</p>
                        <p className="results-message">{getMotivationalMessage(score, total)}</p>
                    </div>
                    <button className="results-try-again" onClick={onTryAgain}>
                        Try again
                    </button>
                </div>

                <p className="results-movie-title">"{learningSetName}"</p>

                <div className="results-list">
                    {flashcards.map((card, index) => {
                        const known = results.get(index) ?? false;
                        return (
                            <div key={card.id} className={`result-card ${known ? 'correct' : 'incorrect'}`}>
                                <span className={`result-icon ${known ? 'correct' : 'incorrect'}`}>
                                    {known ? '✓' : '✗'}
                                </span>
                                <div className="result-card-content">
                                    <span className="result-word">{card.word}</span>
                                    {card.exampleSentence && (
                                        <span className="result-sentence">"{card.exampleSentence}"</span>
                                    )}
                                    <span className="result-translation">{card.translation}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </MainLayout>
    );
};

export default ResultsPage;
