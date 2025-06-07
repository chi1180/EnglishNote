// Vocabulary model class
export class VocabularyModel {
  constructor() {
    this.vocabularies = [];
    this.quizWords = [];
  }

  async loadVocabularies() {
    try {
      const data = await window.electron.loadVocabraryData();
      this.vocabularies = JSON.parse(data).vocabularies;
      console.log(
        `[--DEBUG--] vocab data is ${this.vocabularies}`,
        JSON.parse(data),
        JSON.parse(data).vocabularies,
      );
      return this.vocabularies;
    } catch (error) {
      console.error("Error loading vocabularies:", error);
      return [];
    }
  }

  async getVocabulariesByNotebookId(notebookId) {
    console.log(`[--DEBUG--] vocab data is ${this.vocabularies}`);
    if (this.vocabularies.length < 1) {
      await this.loadVocabularies();
    }
    return (
      this.vocabularies.find((vocab) => vocab.id === notebookId)?.words || []
    );
  }

  async addWord(notebookId, wordData) {
    if (!notebookId || !wordData.word || !wordData.mean || !wordData.example) {
      throw new Error("Notebook ID and word data are required");
    }

    if (await this.isWordExists(wordData.word)) {
      throw new Error("Word already exists");
    }

    const vocabulary = this.vocabularies.find(
      (vocab) => vocab.id === notebookId,
    );
    if (!vocabulary) {
      // Create new vocabulary entry for notebook
      this.vocabularies.push({
        id: notebookId,
        words: [],
      });
    }

    const newWord = {
      ...wordData,
      entered_count: 0,
      corrected_count: 0,
      createdAt: new Date().toISOString(),
    };

    const vocabIndex = this.vocabularies.findIndex(
      (vocab) => vocab.id === notebookId,
    );
    this.vocabularies[vocabIndex].words.push(newWord);
    await this.saveVocabularies();
    return newWord;
  }

  async updateWord(notebookId, word, updates) {
    const vocabulary = this.vocabularies.find(
      (vocab) => vocab.id === notebookId,
    );
    if (!vocabulary) {
      throw new Error("Vocabulary not found");
    }

    const wordIndex = vocabulary.words.findIndex((w) => w.word === word);
    if (wordIndex === -1) {
      throw new Error("Word not found");
    }

    vocabulary.words[wordIndex] = {
      ...vocabulary.words[wordIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveVocabularies();
    return vocabulary.words[wordIndex];
  }

  async deleteWord(notebookId, word) {
    const vocabulary = this.vocabularies.find(
      (vocab) => vocab.id === notebookId,
    );
    if (!vocabulary) {
      return false;
    }

    const wordIndex = vocabulary.words.findIndex((w) => w.word === word);
    if (wordIndex !== -1) {
      vocabulary.words.splice(wordIndex, 1);
      await this.saveVocabularies();
      return true;
    }
    return false;
  }

  async isWordExists(word) {
    if (!this.vocabularies.length) {
      await this.loadVocabularies();
    }

    return this.vocabularies.some((vocab) =>
      vocab.words.some((w) => w.word.toLowerCase() === word.toLowerCase()),
    );
  }

  async saveVocabularies() {
    try {
      const data = JSON.stringify({ vocabularies: this.vocabularies });
      await window.electron.writeVocabraryData(data);
      return true;
    } catch (error) {
      console.error("Error saving vocabularies:", error);
      return false;
    }
  }

  async getAllWords() {
    if (!this.vocabularies.length) {
      await this.loadVocabularies();
    }

    return this.vocabularies.reduce((allWords, vocab) => {
      return allWords.concat(vocab.words);
    }, []);
  }

  async getQuizWords() {
    const allWords = await this.getAllWords();
    return allWords.filter((word) => {
      // Filter out words that have been mastered
      if (word.entered_count >= 5) {
        const correctRate = word.corrected_count / word.entered_count;
        if (correctRate >= 0.8) return false;
      }
      return true;
    });
  }

  async updateWordQuizStats(word, isCorrect) {
    for (const vocab of this.vocabularies) {
      const wordObj = vocab.words.find((w) => w.word === word);
      if (wordObj) {
        wordObj.entered_count = (wordObj.entered_count || 0) + 1;
        if (isCorrect) {
          wordObj.corrected_count = (wordObj.corrected_count || 0) + 1;
        }
        await this.saveVocabularies();
        return true;
      }
    }
    return false;
  }
}

export const vocabularyModel = new VocabularyModel();
