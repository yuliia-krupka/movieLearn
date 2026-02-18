import React from 'react';
import '../css/Test.css';

interface TestCardProps {
    question: string;
    answers: string[];
    correctAnswerIndex: number;
    selectedAnswer: number | null;
    onSelectAnswer: (index: number) => void;
    onNext: () => void;
    hasNext: boolean;
    onSeeResults?: () => void;
    isLast: boolean;
}

const TestCard: React.FC<TestCardProps> = ({
                                               question,
                                               answers,
                                               correctAnswerIndex,
                                               selectedAnswer,
                                               onSelectAnswer,
                                               onNext,
                                               onSeeResults,
                                               isLast
                                           }) => {
    const answered = selectedAnswer !== null;
    const isCorrect = selectedAnswer === correctAnswerIndex;

    return (
        <div className="test-card">
            <div className="test-question-card">
                <div className="test-question-card-body">
                    <h2>{question}</h2>
                </div>
                <div className={`test-question-feedback ${answered ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                     style={{visibility: answered ? 'visible' : 'hidden'}}>
                    {answered ? (isCorrect ? '✓ Correct!' : '✗ Incorrect') : '\u00A0'}
                </div>
            </div>

            <div className="test-answers-grid">
                {answers.map((answer, index) => {
                    let className = 'test-option-btn';
                    if (answered) {
                        if (index === correctAnswerIndex) {
                            className += ' correct';
                        } else if (index === selectedAnswer) {
                            className += ' incorrect';
                        } else {
                            className += ' dimmed';
                        }
                    }

                    return (
                        <button
                            key={index}
                            className={className}
                            onClick={() => !answered && onSelectAnswer(index)}
                            disabled={answered}
                        >
                            {answer}
                        </button>
                    );
                })}
            </div>

            <div className="test-actions">
                {answered ? (
                    isLast ? (
                        <button className="test-next-btn results-btn" onClick={onSeeResults}>
                            See Results
                        </button>
                    ) : (
                        <button className="test-next-btn" onClick={onNext}>
                            Next Question →
                        </button>
                    )
                ) : (
                    <div/>
                )}
            </div>
        </div>
    );
};

export default TestCard;
