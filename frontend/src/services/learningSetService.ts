export interface LearningItemDto {
    id: number;
    type: 'FLASH_CARD' | 'TEST';
    text: string;
    answers?: string[];
    exampleSentence?: string;
    translation: string;
    learningSetId: number;
}

export interface LearningSetDto {
    id: number;
    name: string;
    date: string;
    movieId: number;
    learningItems: LearningItemDto[];
}

export interface FlashCardData {
    word: string;
    translation: string;
    exampleSentence?: string;
    id: number;
}

const API_BASE_URL = 'http://localhost:8080/api';

export const learningSetService = {
    async generateLearningSet(movieId: number): Promise<LearningSetDto> {
        const response = await fetch(`${API_BASE_URL}/learning-sets/generate/${movieId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to generate learning set: ${response.statusText}`);
        }

        return response.json();
    },

    async getLearningSet(id: number): Promise<LearningSetDto> {
        const response = await fetch(`${API_BASE_URL}/learning-sets/${id}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to get learning set: ${response.statusText}`);
        }

        return response.json();
    },

    async getLatestLearningSetByMovie(movieId: number): Promise<LearningSetDto | null> {
        const response = await fetch(`${API_BASE_URL}/learning-sets/movie/${movieId}/latest`, {
            credentials: 'include',
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`Failed to get latest learning set: ${response.statusText}`);
        }

        return response.json();
    },

    extractFlashCards(learningSet: LearningSetDto): FlashCardData[] {
        return learningSet.learningItems
            .filter(item => item.type === 'FLASH_CARD')
            .map(item => ({
                word: item.text,
                translation: item.translation,
                exampleSentence: item.exampleSentence,
                id: item.id
            }));
    }
};
