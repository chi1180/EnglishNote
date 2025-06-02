import { createElement, clearElement } from "../utils/domUtils.js";

class VocabularyQuizView {
  constructor() {
    this.container = document.getElementById("vocabrary-quiz-container");
  }

  async renderQuizStart(onStart) {
    this.clearContainer();
    const startButton = createElement("button", {
      textContent: "Start Quiz",
      className: "btn-primary",
      listeners: {
        click: () => onStart(),
      },
    });
    this.container.appendChild(startButton);
  }

  renderNoVocabularies() {
    this.clearContainer();
    const message = createElement("p", {
      textContent: "No enough vocabularies",
      className: "quiz-message",
    });
    this.container.appendChild(message);
  }

  renderQuestion(questionData, onAnswer) {
    this.clearContainer();

    // Create question header
    const header = createElement("h2", {
      textContent: `Question ${questionData.questionNumber}/${questionData.totalQuestions}`,
    });

    // Create word display
    const wordDisplay = createElement("div", {
      textContent: questionData.word,
      className: "quiz-word",
    });

    // Create options container
    const optionsContainer = createElement("div", {
      className: "quiz-options",
    });

    // Create option buttons
    questionData.options.forEach((option, index) => {
      const optionButton = createElement("button", {
        textContent: option.text,
        className: "quiz-option btn-secondary",
        listeners: {
          click: () => {
            // Disable all buttons after selection
            const buttons = optionsContainer.querySelectorAll("button");
            for (const btn of buttons) btn.disabled = true;
            onAnswer(index);
          },
        },
      });
      optionsContainer.appendChild(optionButton);
    });

    // Append all elements
    this.container.appendChild(header);
    this.container.appendChild(wordDisplay);
    this.container.appendChild(optionsContainer);
  }

  renderAnswerFeedback(result, onNext) {
    const feedbackDiv = createElement("div", {
      className: `quiz-feedback ${result.isCorrect ? "correct" : "incorrect"}`,
    });

    const feedbackText = createElement("p", {
      textContent: result.isCorrect
        ? "Correct!"
        : `Incorrect. The correct answer is: ${result.correctAnswer}`,
    });

    const nextButton = createElement("button", {
      textContent: "Next",
      className: "btn-primary",
      listeners: {
        click: onNext,
      },
    });

    feedbackDiv.appendChild(feedbackText);
    feedbackDiv.appendChild(nextButton);

    this.container.appendChild(feedbackDiv);
  }

  renderQuizResults(results) {
    this.clearContainer();

    const resultsContainer = createElement("div", {
      className: "quiz-results",
    });

    const scoreHeader = createElement("h2", {
      textContent: "Quiz Complete!",
    });

    const scoreText = createElement("p", {
      textContent: `Your score: ${results.score}/${results.totalQuestions} (${Math.round(results.percentage)}%)`,
    });

    resultsContainer.appendChild(scoreHeader);
    resultsContainer.appendChild(scoreText);

    // Add review section
    const reviewSection = createElement("div", {
      className: "quiz-review",
    });

    const reviewHeader = createElement("h3", {
      textContent: "Review",
    });
    reviewSection.appendChild(reviewHeader);

    results.questions.forEach((question, index) => {
      const questionDiv = createElement("div", {
        className: "quiz-review-item",
      });

      const wordText = createElement("p", {
        textContent: `${index + 1}. ${question.word}`,
      });

      const selectedAnswer = question.options[question.selectedAnswer].text;
      const correctAnswer = question.options.find((opt) => opt.isCorrect).text;

      const answerStatus = createElement("p", {
        textContent: `Your answer: ${selectedAnswer}${question.isCorrect ? " ✓" : ` ✗ (Correct: ${correctAnswer})`}`,
        className: question.isCorrect ? "correct" : "incorrect",
      });

      questionDiv.appendChild(wordText);
      questionDiv.appendChild(answerStatus);
      reviewSection.appendChild(questionDiv);
    });

    resultsContainer.appendChild(reviewSection);

    // Add restart button
    const restartButton = createElement("button", {
      textContent: "Close",
      className: "btn-primary",
      listeners: {
        click: () => {
          this.renderQuizStart(() => window.startNewQuiz());
        },
      },
    });

    resultsContainer.appendChild(restartButton);
    this.container.appendChild(resultsContainer);
  }

  clearContainer() {
    clearElement(this.container);
  }
}

export default VocabularyQuizView;
