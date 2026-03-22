import React, {useState, useCallback} from 'react';
import {SoundOutlined} from '@ant-design/icons';
import './FlashCard.css';

interface FlashCardProps {
    word: string;
    translation: string;
    exampleSentence?: string;
    transcription?: string;
    status?: boolean;
    onPrevious?: () => void;
    onNext?: () => void;
    onKnow?: () => void;
    onDontKnow?: () => void;
    hasPrevious?: boolean;
    hasNext?: boolean;
    allReviewed?: boolean;
    onSeeResults?: () => void;
    completionHint?: string;
}

const FlashCard: React.FC<FlashCardProps> = ({
                                                 word,
                                                 translation,
                                                 exampleSentence,
                                                 transcription,
                                                 status,
                                                 onPrevious,
                                                 onNext,
                                                 onKnow,
                                                 onDontKnow,
                                                 hasPrevious = true,
                                                 hasNext = true,
                                                 allReviewed = false,
                                                 onSeeResults,
                                                 completionHint
                                             }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleCardClick = () => setIsFlipped(!isFlipped);
    const handleKnow = () => {
        setIsFlipped(false);
        onKnow?.();
    };
    const handleDontKnow = () => {
        setIsFlipped(false);
        onDontKnow?.();
    };
    const handlePrevious = () => {
        setIsFlipped(false);
        onPrevious?.();
    };
    const handleNext = () => {
        setIsFlipped(false);
        onNext?.();
    };

    const handlePronunciation = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    }, [word]);

    const handleCardKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                setIsFlipped(!isFlipped);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (hasPrevious) handlePrevious();
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (hasNext) handleNext();
                break;
        }
    };

    return (
        <div className="flashcard-container">
            <div className="nav-buttons-mobile">
                {hasPrevious && (
                    <button className="nav-button-mobile" onClick={handlePrevious} aria-label="Previous card">
                        &#10094;
                    </button>
                )}
                {hasNext && (
                    <button className="nav-button-mobile" onClick={handleNext} aria-label="Next card">
                        &#10095;
                    </button>
                )}
            </div>

            <div className="card-area">
                <button
                    className={`nav-button nav-prev ${!hasPrevious ? 'nav-button-disabled' : ''}`}
                    onClick={handlePrevious}
                    aria-label="Previous card"
                    disabled={!hasPrevious}
                >
                    &#10094;
                </button>

                <div
                    className="card-wrapper"
                    onClick={handleCardClick}
                    onKeyDown={handleCardKeyDown}
                    tabIndex={0}
                    role="button"
                    aria-label={isFlipped ? `Translation: ${translation}. Press Enter to flip back` : `Word: ${word}. Press Enter to see translation`}
                >
                    <div className={`card ${isFlipped ? 'flipped' : ''}`}>
                        <div className="front">
                            {status !== undefined && (
                                <div className={`status-badge ${status ? 'status-known' : 'status-unknown'}`}>
                                    {status ? 'KNOWN' : "DON'T KNOW"}
                                </div>
                            )}
                            <h2>{word.toUpperCase()}</h2>
                            {transcription && (
                                <p className="transcription">{transcription}</p>
                            )}
                            {exampleSentence && (
                                <p className="example-sentence">{exampleSentence}</p>
                            )}
                            <p>Tap to see translation</p>
                            <div className="sound-icon-wrapper">
                                <button
                                    className="sound-icon-button"
                                    onClick={handlePronunciation}
                                    aria-label={`Listen to pronunciation of ${word}`}
                                    type="button"
                                >
                                    <SoundOutlined className="sound-icon"/>
                                </button>
                            </div>
                        </div>
                        <div className="back">
                            <h2>{translation.toUpperCase()}</h2>
                            <p>Ukrainian translation</p>
                        </div>
                    </div>
                </div>

                <button
                    className={`nav-button nav-next ${!hasNext ? 'nav-button-disabled' : ''}`}
                    onClick={handleNext}
                    aria-label="Next card"
                    disabled={!hasNext}
                >
                    &#10095;
                </button>
            </div>

            <div className="actions">
                {allReviewed ? (
                    <button className="see-results-button" onClick={onSeeResults}>See Results</button>
                ) : (
                    <>
                        <button
                            className={`know-btn ${status === true ? 'active-known' : ''}`}
                            onClick={handleKnow}
                        >
                            I know
                        </button>
                        <button
                            className={`dont-know-btn ${status === false ? 'active-unknown' : ''}`}
                            onClick={handleDontKnow}
                        >
                            I don't know
                        </button>
                    </>
                )}
            </div>
            {completionHint && (
                <div className="completion-hint">
                    {completionHint}
                </div>
            )}
        </div>
    );
};

export default FlashCard;
