import {useState, useEffect} from 'react';
import {message} from 'antd';
import {learningSetService} from '../services/learningSetService';
import type {FlashCardData, LearningSetDto} from '../types/learningSet';

export interface EditableFlashCard extends Partial<FlashCardData> {
    isNew?: boolean;
    isEditing?: boolean;
    tempId?: number;
    errors?: {
        word?: string;
        translation?: string;
        exampleSentence?: string;
        transcription?: string;
    };
}

export const WORD_LIMIT = 70;
export const TRANSLATION_LIMIT = 150;
export const SENTENCE_LIMIT = 150;
export const TRANSCRIPTION_LIMIT = 100;

export const useFlashCards = (learningSetIdParam: string | undefined, currentUserId: number | undefined) => {
    const [learningSetId, setLearningSetId] = useState<number | null>(null);
    const [learningSet, setLearningSet] = useState<LearningSetDto | null>(null);
    const [flashcards, setFlashcards] = useState<EditableFlashCard[]>([]);
    const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
    const [feedback, setFeedback] = useState('');
    const [regenerating, setRegenerating] = useState(false);
    const [isTestUnlocked, setIsTestUnlocked] = useState(false);
    const [isRefineExpanded, setIsRefineExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingSnapshots, setEditingSnapshots] = useState<Record<string, EditableFlashCard>>({});

    useEffect(() => {
        const loadData = async () => {
            if (!learningSetIdParam) return;
            try {
                setLoading(true);
                const setId = parseInt(learningSetIdParam);
                setLearningSetId(setId);

                const set = await learningSetService.getById(setId);
                setLearningSet(set);

                if (currentUserId) {
                    const cards = await learningSetService.getFlashCards(setId);
                    setFlashcards(cards);

                    const statuses = await learningSetService.getItemStatuses(setId);
                    const allLearned = cards.length > 0 && cards.every(card => {
                        const status = statuses.find(s => s.learningItemId === card.id);
                        return status?.status === 'LEARNED' || status?.status === 'SKIPPED';
                    });
                    setIsTestUnlocked(allLearned);
                } else {
                    setFlashcards([]);
                }
            } catch (error) {
                console.error('Failed to load learning set:', error);
                message.error('Failed to load flashcards');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [learningSetIdParam, currentUserId]);

    const handleRegenerate = async () => {
        if (!feedback.trim() || !learningSetId || selectedCardIds.length === 0) {
            message.warning('Please select items to regenerate and provide feedback');
            return;
        }

        try {
            setRegenerating(true);
            const newCards = await learningSetService.regenerate(learningSetId, feedback, selectedCardIds);

            setFlashcards(prev => {
                const remaining = prev.filter(c => c.id && !selectedCardIds.includes(c.id));
                const formattedNewCards = newCards.map(c => ({...c, isNew: true}));
                return [...remaining, ...formattedNewCards];
            });

            setIsTestUnlocked(false);

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

    const validateCard = (card: EditableFlashCard) => {
        const errors: EditableFlashCard['errors'] = {};

        const word = card.word?.trim() || '';
        const translation = card.translation?.trim() || '';
        const sentence = card.exampleSentence?.trim() || '';
        const transcription = card.transcription?.trim() || '';

        if (!word) errors.word = 'Word is required';
        else if (word.length > WORD_LIMIT) errors.word = `Word is too long (max ${WORD_LIMIT})`;

        if (!translation) errors.translation = 'Translation is required';
        else if (translation.length > TRANSLATION_LIMIT) errors.translation = `Translation is too long (max ${TRANSLATION_LIMIT})`;

        if (sentence.length > SENTENCE_LIMIT) errors.exampleSentence = `Sentence is too long (max ${SENTENCE_LIMIT})`;
        if (transcription.length > TRANSCRIPTION_LIMIT) errors.transcription = `Transcription is too long (max ${TRANSCRIPTION_LIMIT})`;

        return errors;
    };

    const handleSaveCard = async (card: EditableFlashCard) => {
        if (!learningSetId) return;

        const errors = validateCard(card);
        if (Object.keys(errors).length > 0) {
            setFlashcards(prev => prev.map(c =>
                (c.id && c.id === card.id) || (c.tempId && c.tempId === card.tempId)
                    ? {...c, errors}
                    : c
            ));
            message.warning('Please fix validation errors before saving');
            return;
        }

        const word = card.word!.trim();
        const translation = card.translation!.trim();

        try {
            if (card.id) {
                await learningSetService.updateItem(card.id, {
                    id: card.id,
                    text: word,
                    translation: translation,
                    exampleSentence: card.exampleSentence?.trim() || '',
                    transcription: card.transcription?.trim() || '',
                    type: 'FLASH_CARD',
                    answers: [],
                    learningSetId: learningSetId
                });
                message.success('Card updated');
                setFlashcards(prev => prev.map(c => c.id === card.id ? {
                    ...card,
                    word,
                    translation,
                    isEditing: false,
                    errors: undefined
                } : c));

                setEditingSnapshots(prev => {
                    const next = {...prev};
                    delete next[`id-${card.id}`];
                    return next;
                });
            } else {
                const savedItem = await learningSetService.createItem({
                    text: word,
                    translation: translation,
                    exampleSentence: card.exampleSentence?.trim() || '',
                    transcription: card.transcription?.trim() || '',
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
                        isEditing: false,
                        errors: undefined
                    } : c
                ));
            }
        } catch (error) {
            console.error('Failed to save card:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to save card';
            message.error(errorMessage);
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

            const key = card.id ? `id-${card.id}` : `temp-${card.tempId}`;
            setEditingSnapshots(prev => {
                const next = {...prev};
                delete next[key];
                return next;
            });
        } catch (error) {
            console.error('Failed to delete card:', error);
            message.error('Failed to delete card');
        }
    };

    const toggleEdit = (card: EditableFlashCard) => {
        const key = card.id ? `id-${card.id}` : `temp-${card.tempId}`;

        if (!card.isEditing) {
            setEditingSnapshots(prev => ({...prev, [key!]: {...card}}));
            setFlashcards(prev => prev.map(c =>
                (c.id && c.id === card.id) || (c.tempId && c.tempId === card.tempId)
                    ? {...c, isEditing: true, errors: undefined}
                    : c
            ));
        } else {
            const snapshot = editingSnapshots[key!];
            if (snapshot) {
                setFlashcards(prev => prev.map(c =>
                    (c.id && c.id === card.id) || (c.tempId && c.tempId === card.tempId)
                        ? {...snapshot, isEditing: false, errors: undefined}
                        : c
                ));
                setEditingSnapshots(prev => {
                    const next = {...prev};
                    delete next[key!];
                    return next;
                });
            } else {
                setFlashcards(prev => prev.map(c =>
                    (c.id && c.id === card.id) || (c.tempId && c.tempId === card.tempId)
                        ? {...c, isEditing: false, errors: undefined}
                        : c
                ));
            }
        }
    };

    const toggleSelection = (id: number) => {
        setSelectedCardIds(prev => {
            const isSelected = prev.includes(id);
            if (!isSelected) {
                setIsRefineExpanded(true);
                return [...prev, id];
            } else {
                const newSelection = prev.filter(i => i !== id);
                if (newSelection.length === 0) {
                    setIsRefineExpanded(false);
                }
                return newSelection;
            }
        });
    };

    const updateCardState = (id: number | undefined, tempId: number | undefined, field: 'word' | 'translation' | 'exampleSentence' | 'transcription', value: string) => {
        setFlashcards(prev => prev.map(c => {
            if ((id && c.id === id) || (tempId && c.tempId === tempId)) {
                const updatedCard = {...c, [field]: value};
                // Real-time validation for the specific field
                const allErrors = validateCard(updatedCard);
                const updatedErrors = {...c.errors};

                if (allErrors[field]) {
                    updatedErrors[field] = allErrors[field];
                } else {
                    delete updatedErrors[field];
                }

                return {...updatedCard, errors: Object.keys(updatedErrors).length > 0 ? updatedErrors : undefined};
            }
            return c;
        }));
    };

    const handleAddCustomCard = () => {
        const newCard: EditableFlashCard = {
            tempId: Date.now(),
            word: '',
            translation: '',
            exampleSentence: '',
            transcription: '',
            isEditing: true,
            isNew: true,
            errors: undefined
        };
        setFlashcards(prev => [newCard, ...prev]);
    };

    return {
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
    };
};
