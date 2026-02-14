import React, {useState} from 'react';
import {Layout} from 'antd';
import FlashCard from './FlashCard';
import Sidebar from "../layout/Sidebar.tsx";
import TopBar from "../layout/TopBar.tsx";
import '../css/Layout.css';

interface FlashCardData {
    word: string;
    translation: string;
}

const flashcards: FlashCardData[] = [
    {word: "CAPACITY", translation: "МІСТКІСТЬ"},
    {word: "BRILLIANT", translation: "БЛИСКУЧИЙ"},
    {word: "ADVENTURE", translation: "ПРИГОДА"},
    {word: "MYSTERIOUS", translation: "ТАЄМНИЧИЙ"},
    {word: "COURAGE", translation: "СМІЛИВІСТЬ"},
    {word: "INSIGHT", translation: "РОЗУМІННЯ"},
    {word: "CREATIVE", translation: "ТВОРЧИЙ"},
    {word: "INNOVATION", translation: "ІННОВАЦІЯ"},
    {word: "EXPLORATION", translation: "ДОСЛІДЖЕННЯ"},
    {word: "RESILIENCE", translation: "СТІЙКІСТЬ"}
];


const {Content} = Layout;

const FlashCardsModule: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentCard = flashcards[currentIndex];

    const handlePrevious = () => setCurrentIndex(prev => (prev > 0 ? prev - 1 : flashcards.length - 1));
    const handleNext = () => setCurrentIndex(prev => (prev < flashcards.length - 1 ? prev + 1 : 0));
    const handleKnow = () => {
        console.log(`User knows: ${currentCard.word}`);
        handleNext();
    };
    const handleDontKnow = () => {
        console.log(`User doesn't know: ${currentCard.word}`);
        handleNext();
    };

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sidebar/>
            <Layout>
                <TopBar/>
                <Content className="flashcard-content">
                    <FlashCard
                        word={currentCard.word}
                        translation={currentCard.translation}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        onKnow={handleKnow}
                        onDontKnow={handleDontKnow}
                        hasPrevious={currentIndex > 0}
                        hasNext={currentIndex < flashcards.length - 1}
                    />

                    <div className="flashcard-counter">
                        {currentIndex + 1} / {flashcards.length}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default FlashCardsModule;
