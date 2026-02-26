import React, {useState} from 'react';
import {SoundOutlined} from '@ant-design/icons';
import '../css/FlashCard.css';

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

    return (
        <div className="flashcard-container">
            <div className="nav-buttons-mobile">
                {hasPrevious && (
                    <button className="nav-button-mobile" onClick={handlePrevious}>
                        &#10094;
                    </button>
                )}
                {hasNext && (
                    <button className="nav-button-mobile" onClick={handleNext}>
                        &#10095;
                    </button>
                )}
            </div>

            <div className="card-area">
                {hasPrevious && <button className="nav-button nav-prev" onClick={handlePrevious}>&#10094;</button>}

                <div className="card-wrapper" onClick={handleCardClick}>
                    <div className={`card ${isFlipped ? 'flipped' : ''}`}>
                        <div className="front">
                            {status !== undefined && (
                                <div className={`status-badge ${status ? 'status-known' : 'status-unknown'}`}>
                                    {status ? 'KNOWN' : "DON'T KNOW"}
                                </div>
                            )}
                            <h2 style={{margin: 0}}>{word.toUpperCase()}</h2>
                            {transcription && (
                                <p className="transcription">{transcription}</p>
                            )}
                            {exampleSentence && (
                                <p className="example-sentence">{exampleSentence}</p>
                            )}
                            <p>Tap to see translation</p>
                            <div style={{display: 'flex', justifyContent: 'center', marginTop: '15px'}}>
                                <SoundOutlined
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const utterance = new SpeechSynthesisUtterance(word);
                                        utterance.lang = 'en-US';
                                        window.speechSynthesis.speak(utterance);
                                    }}
                                    style={{cursor: 'pointer', fontSize: '1.4rem', color: '#666'}}
                                    title="Listen to pronunciation"
                                />
                            </div>
                        </div>
                        <div className="back">
                            <h2>{translation.toUpperCase()}</h2>
                            <p>Ukrainian translation</p>
                        </div>
                    </div>
                </div>

                {hasNext && <button className="nav-button nav-next" onClick={handleNext}>&#10095;</button>}
            </div>

            <div className="actions">
                {allReviewed ? (
                    <button className="see-results-button" onClick={onSeeResults}>See Results</button>
                ) : (
                    <>
                        <button
                            className={status === true ? 'active-known' : ''}
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
                <div style={{textAlign: 'center', marginTop: '10px', fontStyle: 'italic', color: '#888'}}>
                    {completionHint}
                </div>
            )}
        </div>
    );
};

export default FlashCard;