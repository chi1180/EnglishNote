// Notebook model class
export class NotebookModel {
  constructor() {
    this.notebooks = [];
  }

  async loadNotebooks() {
    try {
      const data = await window.electron.loadNotebookData();
      this.notebooks = JSON.parse(data).notebooks;
      return this.notebooks;
    } catch (error) {
      console.error('Error loading notebooks:', error);
      return [];
    }
  }

  async getNotebookById(id) {
    if (!this.notebooks.length) {
      await this.loadNotebooks();
    }
    return this.notebooks.find(notebook => notebook.id === id);
  }

  async createNotebook(name, filePaths) {
    if (!name.trim() || !filePaths.length) {
      throw new Error('Name and file paths are required');
    }

    const newNotebook = {
      id: this.generateId(),
      name: name.trim(),
      files: filePaths,
      createdAt: new Date().toISOString()
    };

    this.notebooks.push(newNotebook);
    await this.saveNotebooks();
    return newNotebook;
  }

  async deleteNotebook(id) {
    const index = this.notebooks.findIndex(notebook => notebook.id === id);
    if (index !== -1) {
      this.notebooks.splice(index, 1);
      await this.saveNotebooks();
      return true;
    }
    return false;
  }

  async updateNotebook(id, updates) {
    const notebook = await this.getNotebookById(id);
    if (!notebook) {
      throw new Error('Notebook not found');
    }

    Object.assign(notebook, updates);
    await this.saveNotebooks();
    return notebook;
  }

  async saveNotebooks() {
    try {
      const data = JSON.stringify({ notebooks: this.notebooks });
      await window.electron.writeNotebookData(data);
      return true;
    } catch (error) {
      console.error('Error saving notebooks:', error);
      return false;
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const notebookModel = new NotebookModel();