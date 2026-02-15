import React, {useState} from 'react';
import '../css/FlashCard.css';

interface FlashCardProps {
    word: string;
    translation: string;
    exampleSentence?: string;
    onPrevious?: () => void;
    onNext?: () => void;
    onKnow?: () => void;
    onDontKnow?: () => void;
    hasPrevious?: boolean;
    hasNext?: boolean;
    allReviewed?: boolean;
    onSeeResults?: () => void;
}

const FlashCard: React.FC<FlashCardProps> = ({
                                                 word,
                                                 translation,
                                                 exampleSentence,
                                                 onPrevious,
                                                 onNext,
                                                 onKnow,
                                                 onDontKnow,
                                                 hasPrevious = true,
                                                 hasNext = true,
                                                 allReviewed = false,
                                                 onSeeResults
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
                            <h2>{word.toUpperCase()}</h2>
                            {exampleSentence && (
                                <p className="example-sentence">{exampleSentence}</p>
                            )}
                            <p>Tap to see translation</p>
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
                        <button onClick={handleKnow}>I know</button>
                        <button className="dont-know-btn" onClick={handleDontKnow}>I don't know</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default FlashCard;