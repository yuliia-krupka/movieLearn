import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import {learningSetService} from '../../services/learningSetService';
import type {FlashCardData, LearningSetDto} from '../../types/learningSet';
import {CloseOutlined, CheckOutlined, PlusOutlined} from '@ant-design/icons';
import {message} from 'antd';
import '../css/UpdateFlashCards.css';

interface EditableFlashCard extends Partial<FlashCardData> {
    isNew?: boolean;
    isEditing?: boolean;
    tempId?: number;
}

const UpdateFlashCards: React.FC = () => {
    const {id: routeId} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [learningSetId, setLearningSetId] = useState<number | null>(null);
    const [learningSet, setLearningSet] = useState<LearningSetDto | null>(null);
    const [flashcards, setFlashcards] = useState<EditableFlashCard[]>([]);
    const [feedback, setFeedback] = useState('');
    const [regenerating, setRegenerating] = useState(false);
    const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!routeId) return;
            try {
                const setId = parseInt(routeId);
                setLearningSetId(setId);

                const set = await learningSetService.getById(setId);
                setLearningSet(set);

                const cards = await learningSetService.getFlashCards(setId);
                setFlashcards(cards);
            } catch (error) {
                console.error('Failed to load learning set:', error);
                message.error('Failed to load flashcards');
            }
        };
        loadData();
    }, [routeId]);

    const handleRegenerate = async () => {
        if (!feedback.trim() || !learningSetId || selectedCardIds.length === 0) {
            message.warning('Please select items to regenerate and provide feedback');
            return;
        }

        try {
            setRegenerating(true);
            const newCards = await learningSetService.regenerate(learningSetId, feedback, selectedCardIds);

            // Remove regenerated items from current list and add new ones
            // Actually regenerate endpoint backend implementation might return ONLY new items or ALL items? 
            // Based on my backend impl, it returns only NEW items.
            // So we need to filter out the old ones and add new ones.

            setFlashcards(prev => {
                const remaining = prev.filter(c => c.id && !selectedCardIds.includes(c.id));
                const formattedNewCards = newCards.map(c => ({...c, isNew: true}));
                return [...remaining, ...formattedNewCards];
            });

            setSelectedCardIds([]);
            message.success('Regenerated selected words');
            setFeedback('');
        } catch (error) {
            console.error('Failed to regenerate items:', error);
            message.error('Failed to regenerate items');
        } finally {
            setRegenerating(false);
        }
    };

    const handleStartLearning = () => {
        if (learningSet?.movieId) {
            navigate('/flash-cards', {state: {movieId: learningSet.movieId}});
        } else {
            navigate('/flash-cards');
        }
    };

    const handleSaveCard = async (card: EditableFlashCard) => {
        if (!learningSetId) return;
        if (!card.word || !card.translation) {
            message.warning('Word and translation are required');
            return;
        }

        try {
            if (card.id) {
                await learningSetService.updateItem(card.id, {
                    id: card.id,
                    text: card.word!,
                    translation: card.translation!,
                    exampleSentence: card.exampleSentence || '',
                    transcription: card.transcription || '',
                    type: 'FLASH_CARD',
                    answers: [],
                    learningSetId: learningSetId
                });
                message.success('Card updated');
                setFlashcards(prev => prev.map(c => c.id === card.id ? {...card, isEditing: false} : c));
            } else {
                // Should not happen in Review mode typically unless we allow adding new cards manually too
                // For now keeping it for robustness
                const savedItem = await learningSetService.createItem({
                    text: card.word!,
                    translation: card.translation!,
                    exampleSentence: card.exampleSentence || '',
                    transcription: card.transcription || '',
                    type: 'FLASH_CARD',
                    answers: [],
                    learningSetId: learningSetId
                });
                message.success('Card created');
                setFlashcards(prev => prev.map(c =>
                    (c.tempId === card.tempId) ? {
                        ...c,
                        id: savedItem.id,
                        word: savedItem.text,
                        translation: savedItem.translation,
                        exampleSentence: savedItem.exampleSentence,
                        transcription: savedItem.transcription,
                        isNew: false,
                        isEditing: false
                    } : c
                ));
            }
        } catch (error) {
            console.error('Failed to save card:', error);
            message.error('Failed to save card');
        }
    };

    const handleDeleteCard = async (card: EditableFlashCard) => {
        try {
            if (card.id) {
                await learningSetService.deleteItem(card.id);
                message.success('Card removed');
            }
            setFlashcards(prev => prev.filter(c =>
                (card.id && c.id !== card.id) ||
                (card.tempId && c.tempId !== card.tempId)
            ));
        } catch (error) {
            console.error('Failed to delete card:', error);
            message.error('Failed to delete card');
        }
    };

    const toggleEdit = (card: EditableFlashCard) => {
        setFlashcards(prev => prev.map(c =>
            (c.id && c.id === card.id) || (c.tempId && c.tempId === card.tempId)
                ? {...c, isEditing: !c.isEditing}
                : c
        ));
    };

    const toggleSelection = (id: number) => {
        setSelectedCardIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const updateCardState = (id: number | undefined, tempId: number | undefined, field: 'word' | 'translation' | 'exampleSentence' | 'transcription', value: string) => {
        setFlashcards(prev => prev.map(c =>
            (id && c.id === id) || (tempId && c.tempId === tempId)
                ? {...c, [field]: value}
                : c
        ));
    };

    const handleAddCustomCard = () => {
        const newCard: EditableFlashCard = {
            tempId: Date.now(),
            word: '',
            translation: '',
            exampleSentence: '',
            transcription: '',
            isEditing: true,
            isNew: true
        };
        setFlashcards(prev => [newCard, ...prev]);
    };

    return (
        <MainLayout className="update-flashcards-container">
            <div className="custom-request-card">
                <div className="custom-request-title">Refine Flashcards</div>
                <div className="custom-request-subtitle">
                    Select words you don't like and describe how to improve them (e.g., "Too easy", "Make it more
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

                    <button
                        className="start-learning-btn"
                        onClick={handleStartLearning}
                    >
                        Start Learning
                    </button>
                </div>
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
