import React from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import {CloseOutlined, CheckOutlined, PlusOutlined, CaretRightOutlined} from '@ant-design/icons';
import {useAuth} from '../auth/useAuth';
import '../css/UpdateFlashCards.css';
import {useFlashCards} from '../../hooks/useFlashCards';

const UpdateFlashCards: React.FC = () => {
    const {id: routeId} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {currentUserId} = useAuth();

    const {
        learningSet,
        flashcards,
        selectedCardIds,
        feedback,
        setFeedback,
        regenerating,
        isTestUnlocked,
        isRefineExpanded,
        setIsRefineExpanded,
        handleRegenerate,
        handleSaveCard,
        handleDeleteCard,
        toggleEdit,
        toggleSelection,
        updateCardState,
        handleAddCustomCard
    } = useFlashCards(routeId, currentUserId);

    const handleStartLearning = () => {
        if (learningSet?.movieId) {
            navigate('/flash-cards', {state: {movieId: learningSet.movieId}});
        } else {
            navigate('/flash-cards');
        }
    };

    const handleGoToTest = () => {
        if (learningSet?.movieId) {
            navigate('/tests', {state: {movieId: learningSet.movieId}});
        } else {
            navigate('/tests');
        }
    };

    return (
        <MainLayout className="update-flashcards-container">

            <div className="study-dashboard-card">
                <div className="dashboard-title">Start Learning</div>
                <div className="dashboard-subtitle">Master your vocabulary with flashcards and tests</div>

                <div className="dashboard-actions">
                    <div className="dashboard-action-item">
                        <button
                            className="dashboard-btn flashcards-btn"
                            onClick={handleStartLearning}
                        >
                            Flash Cards
                        </button>
                        <span className="action-description">Learn new words</span>
                    </div>

                    <div className="dashboard-action-item">
                        <button
                            className={`dashboard-btn tests-btn ${!isTestUnlocked ? 'locked' : ''}`}
                            onClick={handleGoToTest}
                            disabled={!isTestUnlocked}
                            title={!isTestUnlocked ? "Complete flashcards to unlock" : ""}
                        >
                            Tests {!isTestUnlocked && <span className="lock-icon">🔒</span>}
                        </button>
                        <span className="action-description">
                            {isTestUnlocked ? "Test your knowledge" : "Unlock by learning words"}
                        </span>
                    </div>
                </div>

                <div className="info-message" style={{
                    marginTop: '16px',
                    color: '#8c8c8c',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    fontStyle: 'italic'
                }}>
                    Tip: Clicking 'I know' 3 times marks the word as learned and unlocks test.
                </div>
            </div>

            <div className="custom-request-card">
                <div
                    className="custom-request-title"
                    onClick={() => setIsRefineExpanded(!isRefineExpanded)}
                    style={{cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
                >
                    Refine Flashcards
                    <CaretRightOutlined
                        style={{
                            transform: isRefineExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s',
                            color: '#faad14',
                            fontSize: '20px'
                        }}
                    />
                </div>

                {isRefineExpanded && (
                    <div className="refine-content" style={{marginTop: '16px'}}>
                        <div className="custom-request-subtitle">
                            Select words you don't like and describe how to improve them (e.g., "Too easy", "Make it
                            more
                            formal").
                        </div>

                        <label className="request-label">Feedback for Regeneration</label>
                        <textarea
                            className="request-textarea"
                            placeholder="Feedback for selected cards..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            disabled={selectedCardIds.length === 0}
                        />

                        <div className="action-buttons">
                            <button
                                className="generate-btn"
                                onClick={handleRegenerate}
                                disabled={regenerating || selectedCardIds.length === 0}
                            >
                                {regenerating ? 'Regenerating...' : `Regenerate Selected (${selectedCardIds.length})`}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="suggested-words-header">
                <div className="suggested-words-title">
                    "{learningSet?.name || 'Movie Title'}" - <span>Review Words</span>
                </div>
                <button className="add-custom-btn" onClick={handleAddCustomCard}>
                    <PlusOutlined/> Add Custom Word
                </button>
            </div>

            <div className="cards-list">
                {flashcards.map((card) => (
                    <div key={card.id || card.tempId}
                         className={`word-card ${card.id && selectedCardIds.includes(card.id) ? 'selected' : ''}`}>
                        <div className="card-selection" style={{display: 'none'}}>
                            {/* Hidden manual checkbox since we use action buttons now */}
                        </div>

                        <div className="word-content">
                            {card.isEditing ? (
                                <>
                                    <div className="input-group">
                                        <label className="input-label">Word</label>
                                        <input
                                            className="edit-input"
                                            value={card.word || ''}
                                            onChange={(e) => updateCardState(card.id, card.tempId, 'word', e.target.value)}
                                            placeholder="Word"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Example Sentence</label>
                                        <input
                                            className="edit-input"
                                            value={card.exampleSentence || ''}
                                            onChange={(e) => updateCardState(card.id, card.tempId, 'exampleSentence', e.target.value)}
                                            placeholder="Example Sentence"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Transcription</label>
                                        <input
                                            className="edit-input"
                                            value={card.transcription || ''}
                                            onChange={(e) => updateCardState(card.id, card.tempId, 'transcription', e.target.value)}
                                            placeholder="Transcription (e.g., [həˈləʊ])"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Translation</label>
                                        <input
                                            className="edit-input"
                                            value={card.translation || ''}
                                            onChange={(e) => updateCardState(card.id, card.tempId, 'translation', e.target.value)}
                                            placeholder="Translation"
                                        />
                                    </div>
                                    <div className="card-actions">
                                        <button className="save-btn" onClick={() => handleSaveCard(card)}>
                                            <CheckOutlined/> Save
                                        </button>
                                        <button className="cancel-btn"
                                                onClick={() => card.isNew ? handleDeleteCard(card) : toggleEdit(card)}>
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div onClick={() => toggleEdit(card)} style={{cursor: 'pointer'}}>
                                    <div className="word-text">{card.word}</div>
                                    {card.transcription &&
                                        <div className="word-transcription">{card.transcription}</div>}
                                    <div className="word-sentence">"{card.exampleSentence}"</div>
                                    <div className="word-translation">{card.translation}</div>
                                </div>
                            )}
                        </div>

                        {!card.isEditing && (
                            <div className="item-actions">
                                <button
                                    className={`word-status-btn reject ${card.id && selectedCardIds.includes(card.id) ? 'active' : ''}`}
                                    onClick={() => card.id && (selectedCardIds.includes(card.id) ? null : toggleSelection(card.id))}
                                >
                                    <CloseOutlined/>
                                </button>
                                <button
                                    className={`word-status-btn approve ${!card.id || !selectedCardIds.includes(card.id) ? 'active' : ''}`}
                                    onClick={() => card.id && (selectedCardIds.includes(card.id) ? toggleSelection(card.id) : null)}
                                >
                                    <CheckOutlined/>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </MainLayout>
    );
};

export default UpdateFlashCards;
