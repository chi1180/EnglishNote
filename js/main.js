import { notebookView } from "./views/notebookView.js";
import { vocabularyView } from "./views/vocabularyView.js";
import { vocabularyModel } from "./models/vocabularyModel.js";
import VocabularyQuizModel from "./models/vocabularyQuizModel.js";
import VocabularyQuizView from "./views/vocabularyQuizView.js";

// Initialize quiz components
const quizModel = new VocabularyQuizModel();
const quizView = new VocabularyQuizView();

// Initialize application
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await notebookView.refreshNotebookList();
    await vocabularyModel.loadVocabularies();
    setCustomizedAlert();
    initializeQuiz();
  } catch (error) {
    console.error("Failed to initialize application:", error);
  }
});

// Quiz initialization and event handling
async function initializeQuiz() {
  quizView.renderQuizStart(() => startNewQuiz());
}

async function startNewQuiz() {
  try {
    const currentQuestion = await quizModel.initializeQuiz();
    if (!currentQuestion) {
      quizView.renderNoVocabularies();
      return;
    }
    quizView.renderQuestion(currentQuestion, handleAnswer);
  } catch (error) {
    console.error("Failed to start quiz:", error);
    quizView.renderNoVocabularies();
  }
}

async function handleAnswer(selectedOptionIndex) {
  try {
    const result = await quizModel.submitAnswer(selectedOptionIndex);
    quizView.renderAnswerFeedback(result, () => {
      if (quizModel.isQuizComplete()) {
        const results = quizModel.getQuizResults();
        quizView.renderQuizResults(results);
      } else {
        const nextQuestion = quizModel.nextQuestion();
        quizView.renderQuestion(nextQuestion, handleAnswer);
      }
    });
  } catch (error) {
    console.error("Failed to handle answer:", error);
  }
}

// Export for global access
window.notebookView = notebookView;
window.vocabularyView = vocabularyView;
window.vocabularyModel = vocabularyModel;
window.quizModel = quizModel;
window.quizView = quizView;
window.startNewQuiz = startNewQuiz;

// Set customized alert method
function setCustomizedAlert() {
  const originalAlert = window.alert;
  window.alert = async (...args) => {
    originalAlert.apply(window, args);
    await window.electron.focusOnMainWindow();
  };
}