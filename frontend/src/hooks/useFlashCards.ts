import {useState, useEffect} from 'react';
import {message} from 'antd';
import {learningSetService} from '../services/learningSetService';
import type {FlashCardData, LearningSetDto} from '../types/learningSet';

export interface EditableFlashCard extends Partial<FlashCardData> {
    isNew?: boolean;
    isEditing?: boolean;
    tempId?: number;
}

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

    useEffect(() => {
        const loadData = async () => {
            if (!learningSetIdParam) return;
            try {
                setLoading(true);
                const setId = parseInt(learningSetIdParam);
                setLearningSetId(setId);

                const set = await learningSetService.getById(setId);
                setLearningSet(set);

                const cards = await learningSetService.getFlashCards(setId);
                setFlashcards(cards);

                if (currentUserId) {
                    const statuses = await learningSetService.getItemStatuses(currentUserId, setId);
                    const allLearned = cards.length > 0 && cards.every(card => {
                        const status = statuses.find(s => s.learningItemId === card.id);
                        return status?.status === 'LEARNED' || status?.status === 'SKIPPED';
                    });
                    setIsTestUnlocked(allLearned);
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
