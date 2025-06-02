// Vocabulary model class
export class VocabularyModel {
  constructor() {
    this.vocabularies = [];
  }

  async loadVocabularies() {
    try {
      const data = await window.electron.loadVocabraryData();
      this.vocabularies = JSON.parse(data).vocabraries;
      return this.vocabularies;
    } catch (error) {
      console.error('Error loading vocabularies:', error);
      return [];
    }
  }

  async getVocabulariesByNotebookId(notebookId) {
    if (!this.vocabularies.length) {
      await this.loadVocabularies();
    }
    return this.vocabularies.find(vocab => vocab.id === notebookId)?.words || [];
  }

  async addWord(notebookId, wordData) {
    if (!notebookId || !wordData.word || !wordData.mean || !wordData.example) {
      throw new Error('Notebook ID and word data are required');
    }

    if (await this.isWordExists(wordData.word)) {
      throw new Error('Word already exists');
    }

    const vocabulary = this.vocabularies.find(vocab => vocab.id === notebookId);
    if (!vocabulary) {
      // Create new vocabulary entry for notebook
      this.vocabularies.push({
        id: notebookId,
        words: []
      });
    }

    const newWord = {
      ...wordData,
      entered_count: 0,
      corrected_count: 0,
      createdAt: new Date().toISOString()
    };

    const vocabIndex = this.vocabularies.findIndex(vocab => vocab.id === notebookId);
    this.vocabularies[vocabIndex].words.push(newWord);
    await this.saveVocabularies();
    return newWord;
  }

  async updateWord(notebookId, word, updates) {
    const vocabulary = this.vocabularies.find(vocab => vocab.id === notebookId);
    if (!vocabulary) {
      throw new Error('Vocabulary not found');
    }

    const wordIndex = vocabulary.words.findIndex(w => w.word === word);
    if (wordIndex === -1) {
      throw new Error('Word not found');
    }

    vocabulary.words[wordIndex] = {
      ...vocabulary.words[wordIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.saveVocabularies();
    return vocabulary.words[wordIndex];
  }

  async deleteWord(notebookId, word) {
    const vocabulary = this.vocabularies.find(vocab => vocab.id === notebookId);
    if (!vocabulary) {
      return false;
    }

    const wordIndex = vocabulary.words.findIndex(w => w.word === word);
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
    
    return this.vocabularies.some(vocab => 
      vocab.words.some(w => w.word.toLowerCase() === word.toLowerCase())
    );
  }

  async saveVocabularies() {
    try {
      const data = JSON.stringify({ vocabraries: this.vocabularies });
      await window.electron.writeVocabraryData(data);
      return true;
    } catch (error) {
      console.error('Error saving vocabularies:', error);
      return false;
    }
  }
}

export const vocabularyModel = new VocabularyModel();