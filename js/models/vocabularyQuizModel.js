import { vocabularyModel } from './vocabularyModel.js';

class VocabularyQuizModel {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.questions = [];
    }

    async initializeQuiz() {
        const quizWords = await vocabularyModel.getQuizWords();
        
        if (quizWords.length < 4) {
            return null;
        }

        // Shuffle and select words for the quiz
        const shuffledWords = this.shuffleArray([...quizWords]);
        
        // Create questions from words
        this.questions = shuffledWords.map(word => {
            // Get incorrect options (excluding the correct answer)
            const otherWords = quizWords.filter(w => w.word !== word.word);
            const shuffledOptions = this.shuffleArray(otherWords).slice(0, 3);
            
            // Add correct answer and shuffle all options
            const allOptions = this.shuffleArray([
                ...shuffledOptions.map(w => ({ text: w.mean, isCorrect: false })),
                { text: word.mean, isCorrect: true }
            ]);

            return {
                word: word.word,
                options: allOptions,
                selectedAnswer: null,
                isCorrect: null
            };
        });

        this.currentQuestionIndex = 0;
        this.currentQuiz = {
            totalQuestions: this.questions.length,
            questions: this.questions
        };

        return this.getCurrentQuestion();
    }

    getCurrentQuestion() {
        if (!this.currentQuiz || this.currentQuestionIndex >= this.questions.length) {
            return null;
        }
        return {
            ...this.questions[this.currentQuestionIndex],
            questionNumber: this.currentQuestionIndex + 1,
            totalQuestions: this.questions.length
        };
    }

    async submitAnswer(selectedOptionIndex) {
        if (!this.currentQuiz || this.currentQuestionIndex >= this.questions.length) {
            return null;
        }

        const currentQuestion = this.questions[this.currentQuestionIndex];
        const selectedOption = currentQuestion.options[selectedOptionIndex];
        const isCorrect = selectedOption.isCorrect;

        currentQuestion.selectedAnswer = selectedOptionIndex;
        currentQuestion.isCorrect = isCorrect;

        // Update word stats in vocabulary model
        await vocabularyModel.updateWordQuizStats(currentQuestion.word, isCorrect);

        return {
            isCorrect,
            correctAnswer: currentQuestion.options.find(option => option.isCorrect).text
        };
    }

    nextQuestion() {
        if (!this.currentQuiz || this.currentQuestionIndex >= this.questions.length - 1) {
            return null;
        }
        this.currentQuestionIndex += 1;
        return this.getCurrentQuestion();
    }

    getQuizResults() {
        if (!this.currentQuiz) return null;
        
        const correctAnswers = this.questions.filter(q => q.isCorrect).length;
        return {
            score: correctAnswers,
            totalQuestions: this.questions.length,
            percentage: (correctAnswers / this.questions.length) * 100,
            questions: this.questions
        };
    }

    isQuizComplete() {
        return this.currentQuestionIndex >= this.questions.length - 1 &&
               this.questions[this.questions.length - 1].selectedAnswer !== null;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

export default VocabularyQuizModel;