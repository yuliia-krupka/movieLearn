import React from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import {
    CloseOutlined,
    CheckOutlined,
    PlusOutlined,
    CaretRightOutlined,
    SoundOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import {Spin} from 'antd';
import {useAuth} from '../auth/useAuth';
import './UpdateFlashCards.css';
import '../movie/MovieDetails.css';
import {
    useFlashCards,
    WORD_LIMIT,
    TRANSLATION_LIMIT,
    SENTENCE_LIMIT,
    TRANSCRIPTION_LIMIT
} from '../hooks/useFlashCards.ts';
import {learningSetService} from '../../services/learningSetService';
import learningCat from '../../assets/learning-cat.png';

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
        loading,
        handleRegenerate,
        handleSaveCard,
        handleDeleteCard,
        toggleEdit,
        toggleSelection,
        updateCardState,
        handleAddCustomCard
    } = useFlashCards(routeId, currentUserId);

    const handleStartLearning = async () => {
        if (learningSet?.id) {
            try {
                await learningSetService.approveSet(learningSet.id);
                navigate(`/learning-sets/${learningSet.id}/flashcards`);
            } catch (error) {
                console.error("Failed to approve set and navigate", error);
                navigate(`/learning-sets/${learningSet.id}/flashcards`);
            }
        } else {
            navigate('/home');
        }
    };

    const handleGoToTest = () => {
        if (learningSet?.id) {
            navigate(`/learning-sets/${learningSet.id}/tests`);
        } else {
            navigate('/home');
        }
    };

    if (loading) {
        return (
            <MainLayout className="update-flashcards-container">
                <div className="loading-spinner-container">
                    <Spin size="large" tip="Loading vocabulary...">
                        <div className="loading-spacer"/>
                    </Spin>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout className="update-flashcards-container">
            {regenerating && (
                <div className="generating-overlay">
                    <div className="generating-content">
                        <img
                            src={learningCat}
                            alt="Regenerating content..."
                            className="generating-gif"
                        />
                        <h2 className="generating-title">Regenerating Magic...</h2>
                        <p className="generating-text">
                            Personalizing your vocabulary set based on your feedback.
                        </p>
                        <Spin size="large" className="generating-spinner"/>
                    </div>
                </div>
            )}

            <div className="study-dashboard-card">
                <div className="dashboard-title">
                    {learningSet?.status === 'READY' ? 'Your Flashcards' : 'Start Learning'}
                    {learningSet?.englishLevel && (
                        <span className="level-badge" style={{marginLeft: '10px'}}>{learningSet.englishLevel}</span>
                    )}
                </div>
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

                <div className="info-message">
                    Tip: Clicking 'I know' during flashcard review marks the word as learned and unlocks tests.
                </div>

                {learningSet?.status !== 'READY' && (
                    <div className="warning-message prominent-warning">
                        <ExclamationCircleOutlined/>
                        <span><strong>Important:</strong> Once you approve these flashcards, the movie script will be permanently deleted and you won't be able to regenerate the flashcards again.</span>
                    </div>
                )}
            </div>

            {learningSet?.status !== 'READY' && (
                <div className="custom-request-card">
                    <div
                        className="custom-request-title"
                        onClick={() => setIsRefineExpanded(!isRefineExpanded)}
                    >
                        Refine Flashcards
                        <CaretRightOutlined
                            className={`refine-toggle-icon ${isRefineExpanded ? 'expanded' : ''}`}
                        />
                    </div>

                    {isRefineExpanded && (
                        <div className="refine-content">
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
                                    title={""}
                                >
                                    {regenerating ? 'Regenerating...' : `Regenerate Selected (${selectedCardIds.length})`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="suggested-words-header">
                <div>
                    <div className="suggested-words-title">
                        "{learningSet?.name || 'Movie Title'}" - <span>Review Words</span>
                    </div>
                    <div style={{color: '#8c8c8c', fontSize: '0.85rem', marginTop: '4px'}}>
                        You can have a maximum of 20 flashcards per set.
                    </div>
                </div>
                <div className="add-word-container">
                    {learningSet?.status !== 'READY' && flashcards.length >= 20 && (
                        <span className="limit-warning-text">Max limit of 20 cards reached.</span>
                    )}
                    {learningSet?.status !== 'READY' && (
                        <button
                            className="add-custom-btn"
                            onClick={handleAddCustomCard}
                            disabled={flashcards.length >= 20}
                            title={flashcards.length >= 20 ? "Maximum limit of 20 flashcards reached." : ""}
                        >
                            <PlusOutlined/> Add Custom Word
                        </button>
                    )}
                </div>
            </div>

            <div className="cards-list">
                {flashcards.map((card) => (
                    <div key={card.id || card.tempId}
                         className={`word-card ${card.id && selectedCardIds.includes(card.id) ? 'selected' : ''}`}>
                        <div className="card-selection">
                        </div>

                        <div className="word-content">
                            {card.isEditing ? (
                                <>
                                    <div className="input-group">
                                        <div className="input-header">
                                            <label className="input-label">Word</label>
                                            {(card.word?.length || 0) > WORD_LIMIT && (
                                                <span className="char-counter limit-exceeded">
                                                    {card.word?.length || 0}/{WORD_LIMIT}
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            className={`edit-input ${card.errors?.word ? 'error' : ''}`}
                                            value={card.word || ''}
                                            onChange={(e) => updateCardState(card.id, card.tempId, 'word', e.target.value)}
                                            placeholder="Word"
                                        />
                                        {card.errors?.word && <div className="error-message">{card.errors.word}</div>}
                                    </div>
                                    <div className="input-group">
                                        <div className="input-header">
                                            <label className="input-label">Example Sentence</label>
                                            {(card.exampleSentence?.length || 0) > SENTENCE_LIMIT && (
                                                <span className="char-counter limit-exceeded">
                                                    {card.exampleSentence?.length || 0}/{SENTENCE_LIMIT}
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            className={`edit-input ${card.errors?.exampleSentence ? 'error' : ''}`}
                                            value={card.exampleSentence || ''}
                                            onChange={(e) => updateCardState(card.id, card.tempId, 'exampleSentence', e.target.value)}
                                            placeholder="Example Sentence"
                                        />
                                        {card.errors?.exampleSentence &&
                                            <div className="error-message">{card.errors.exampleSentence}</div>}
                                    </div>
                                    <div className="input-group">
                                        <div className="input-header">
                                            <label className="input-label">Transcription</label>
                                            {(card.transcription?.length || 0) > TRANSCRIPTION_LIMIT && (
                                                <span className="char-counter limit-exceeded">
                                                    {card.transcription?.length || 0}/{TRANSCRIPTION_LIMIT}
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            className={`edit-input ${card.errors?.transcription ? 'error' : ''}`}
                                            value={card.transcription || ''}
                                            onChange={(e) => updateCardState(card.id, card.tempId, 'transcription', e.target.value)}
                                            placeholder="Transcription (e.g., [həˈləʊ])"
                                        />
                                        {card.errors?.transcription &&
                                            <div className="error-message">{card.errors.transcription}</div>}
                                    </div>
                                    <div className="input-group">
                                        <div className="input-header">
                                            <label className="input-label">Translation</label>
                                            {(card.translation?.length || 0) > TRANSLATION_LIMIT && (
                                                <span className="char-counter limit-exceeded">
                                                    {card.translation?.length || 0}/{TRANSLATION_LIMIT}
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            className={`edit-input ${card.errors?.translation ? 'error' : ''}`}
                                            value={card.translation || ''}
                                            onChange={(e) => updateCardState(card.id, card.tempId, 'translation', e.target.value)}
                                            placeholder="Translation"
                                        />
                                        {card.errors?.translation &&
                                            <div className="error-message">{card.errors.translation}</div>}
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
                                <div
                                    className="word-content-display"
                                    onClick={() => learningSet?.status !== 'READY' && toggleEdit(card)}
                                    style={learningSet?.status === 'READY' ? {cursor: 'default'} : {}}
                                >
                                    <div className="word-text"
                                         style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        {card.word}
                                        {card.word && (
                                            <SoundOutlined
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const utterance = new SpeechSynthesisUtterance(card.word!);
                                                    utterance.lang = 'en-US';
                                                    window.speechSynthesis.speak(utterance);
                                                }}
                                                style={{cursor: 'pointer', color: '#5A73DB', fontSize: '1.2rem'}}
                                                title="Listen to pronunciation"
                                            />
                                        )}
                                    </div>
                                    {card.transcription &&
                                        <div className="word-transcription">{card.transcription}</div>}
                                    <div className="word-sentence">"{card.exampleSentence}"</div>
                                    <div className="word-translation">{card.translation}</div>
                                </div>
                            )}
                        </div>

                        {!card.isEditing && learningSet?.status !== 'READY' && (
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
