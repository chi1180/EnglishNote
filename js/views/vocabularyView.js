import {
  createElement,
  clearElement,
  getById,
  getValue,
  appendChildren,
} from "../utils/domUtils.js";
import { vocabularyModel } from "../models/vocabularyModel.js";

class VocabularyView {
  constructor() {
    this.vocabContainer = getById("vocabrary-container");
    this.vocabManageContainer = getById("vocab-manage-container");
  }

  async showVocabularyList(notebookId) {
    // Clear both containers before adding new content
    this.clearVocabularyContainers();

    // Load and display vocabulary words
    const words = await vocabularyModel.getVocabulariesByNotebookId(notebookId);
    if (words && words.length > 0) {
      for (const word of words) this.createVocabularyCard(word);
    }

    // Show add button for adding new vocabulary
    this.showAddButton();
  }

  clearVocabularyContainers() {
    clearElement(this.vocabContainer);
    clearElement(this.vocabManageContainer);
  }

  createVocabularyCard(wordData) {
    const card = createElement("div", {
      className: "vocabrary-card",
      listeners: {
        click: (e) => this.toggleCardExpansion(e.currentTarget),
      },
    });

    const wordElem = createElement("p", {
      className: "word",
      textContent: wordData.word,
    });

    const meanElem = createElement("p", {
      className: "mean",
      textContent: wordData.mean,
    });

    const exampleElem = createElement("p", {
      className: "example",
      textContent: wordData.example,
    });

    appendChildren(card, [wordElem, meanElem, exampleElem]);
    this.vocabContainer.appendChild(card);
  }

  toggleCardExpansion(card) {
    card.classList.toggle("expand");
  }

  showAddButton() {
    const addButton = createElement("button", {
      className: "btn-primary",
      textContent: "New",
      listeners: {
        click: () => this.showAddForm(),
      },
    });
    this.vocabManageContainer.appendChild(addButton);
  }

  showAddForm() {
    clearElement(this.vocabManageContainer);

    const field = createElement("div", { className: "input-field" });

    const wordInput = createElement("input", {
      attributes: {
        type: "text",
        placeholder: "Enter word here",
      },
    });

    const meanInput = createElement("input", {
      attributes: {
        type: "text",
        placeholder: "Enter mean here",
      },
    });

    const exampleInput = createElement("textarea", {
      attributes: {
        placeholder: "Enter example here",
      },
    });

    const addButton = createElement("button", {
      className: "btn-primary",
      textContent: "Add",
      listeners: {
        click: () => this.handleAddWord(wordInput, meanInput, exampleInput),
      },
    });

    appendChildren(field, [wordInput, meanInput, exampleInput, addButton]);
    this.vocabManageContainer.appendChild(field);
  }

  async handleAddWord(wordInput, meanInput, exampleInput) {
    const word = getValue(wordInput);
    const mean = getValue(meanInput);
    const example = getValue(exampleInput);
    const selectedNotebook = document.querySelector(".notebook-selected");

    if (!word || !mean || !example) {
      alert("Please fill all inputs");
      return;
    }

    if (!selectedNotebook) {
      alert("No notebook selected");
      return;
    }

    try {
      const wordData = { word, mean, example };
      await vocabularyModel.addWord(selectedNotebook.dataset.id, wordData);
      await this.showVocabularyList(selectedNotebook.dataset.id);
    } catch (error) {
      if (error.message === "Word already exists") {
        alert("This word is already exists");
      } else {
        alert("Error adding word: ".concat(error.message));
      }
    }
  }
}

export const vocabularyView = new VocabularyView();
