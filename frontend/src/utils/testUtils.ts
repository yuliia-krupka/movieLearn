export const shuffleAnswers = <T>(answers: T[], correctAnswerIndex: number) => {
    const indices = answers.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const shuffledAnswers = indices.map(i => answers[i]);
    const newCorrectIndex = indices.indexOf(correctAnswerIndex);
    return {shuffledAnswers, newCorrectIndex};
};
