import type {
    LearningSetDto,
    ItemStatusDto,
    FlashCardData,
    TestItemData,
    ApiFlashCard,
    ApiTestItem
} from '../types/learningSet';


export const learningSetService = {
    async getOrCreateByMovie(movieId: number): Promise<LearningSetDto> {
        const response = await fetch(`/api/learning-sets/movie/${movieId}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to get learning set: ${response.statusText}`);
        }

        return response.json();
    },

    async getLatestByUserAndMovie(movieId: number, userId: number, level?: string, interests?: string): Promise<LearningSetDto | null> {
        let url = `/api/learning-sets/movie/${movieId}/user/${userId}/latest`;
        const params = new URLSearchParams();
        if (level) params.append('level', level);
        if (interests) params.append('interests', interests);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        const response = await fetch(url, {
            credentials: 'include',
        });

        if (response.status === 404) return null;
        if (!response.ok) return null;

        const data = await response.json();
        return data || null;
    },

    async recordAnswer(userId: number, learningItemId: number, correct: boolean): Promise<void> {
        const params = new URLSearchParams({
            userId: String(userId),
            learningItemId: String(learningItemId),
            correct: String(correct),
        });
        const response = await fetch(`/api/user-learning-status/answer?${params}`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!response.ok) {
            console.error('Failed to record answer:', response.statusText);
        }
    },

    async getItemStatuses(userId: number, learningSetId: number): Promise<ItemStatusDto[]> {
        const response = await fetch(
            `/api/user-learning-status/set/${learningSetId}/user/${userId}`,
            {credentials: 'include'}
        );
        if (!response.ok) return [];
        const data: ItemStatusDto[] = await response.json();
        return data.map((item) => ({
            learningItemId: item.learningItemId,
            status: item.status,
            correctAnswers: item.correctAnswers,
            totalAttempts: item.totalAttempts,
        }));
    },

    async completeFlashcards(userId: number, learningSetId: number, score: number): Promise<void> {
        const params = new URLSearchParams({
            userId: String(userId),
            learningSetId: String(learningSetId),
            score: String(score),
        });
        const response = await fetch(`/api/user-learning-sets/complete-flashcards?${params}`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!response.ok) {
            console.error('Failed to complete flashcards:', response.statusText);
        }
    },

    async getFlashCards(learningSetId: number): Promise<FlashCardData[]> {
        const response = await fetch(`/api/learning-sets/${learningSetId}/flashcards`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to get flash cards: ${response.statusText}`);
        }

        const items: ApiFlashCard[] = await response.json();
        return items.map((item) => ({
            word: item.text,
            translation: item.translation,
            exampleSentence: item.exampleSentence,
            transcription: item.transcription,
            id: item.id
        }));
    },

    async getTestItems(learningSetId: number): Promise<TestItemData[]> {
        const response = await fetch(`/api/learning-sets/${learningSetId}/tests`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to get test items: ${response.statusText}`);
        }

        const items: ApiTestItem[] = await response.json();
        return items.map((item) => ({
            id: item.id,
            text: item.text,
            question: item.text,
            answers: item.answers,
            correctAnswerIndex: item.correctAnswerIndex,
            translation: item.translation
        }));
    },

    async getById(id: number): Promise<LearningSetDto> {
        const response = await fetch(`/api/learning-sets/${id}`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to get learning set');
        return response.json();
    },

    async createItem(item: Partial<ApiFlashCard> & { learningSetId: number, type: string }): Promise<ApiFlashCard> {
        const response = await fetch(`/api/learning-items`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(item),
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to create item');
        return response.json();
    },

    async updateItem(id: number, item: Partial<ApiFlashCard> & {
        learningSetId: number,
        type: string
    }): Promise<ApiFlashCard> {
        const response = await fetch(`/api/learning-items/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(item),
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to update item');
        return response.json();
    },

    async deleteItem(id: number): Promise<void> {
        const response = await fetch(`/api/learning-items/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to delete item');
    },
    async regenerate(learningSetId: number, feedback: string, itemIds: number[]): Promise<FlashCardData[]> {
        const response = await fetch(`/api/learning-items/regenerate`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({learningSetId, feedback, itemIds}),
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to regenerate items');
        const items: ApiFlashCard[] = await response.json();
        return items.map((item) => ({
            word: item.text,
            translation: item.translation,
            exampleSentence: item.exampleSentence,
            transcription: item.transcription,
            id: item.id
        }));
    },


    async startLearningForUser(movieId: number, userId: number): Promise<LearningSetDto> {
        const response = await fetch(`/api/learning/movie/${movieId}/start?userId=${userId}`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to start learning: ${response.statusText}`);
        }
        return response.json();
    },

    async approveSet(learningSetId: number): Promise<void> {
        const response = await fetch(`/api/learning/set/${learningSetId}/approve`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to approve set');
    }
};
