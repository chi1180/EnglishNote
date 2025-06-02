import { notebookView } from './views/notebookView.js';
import { vocabularyView } from './views/vocabularyView.js';

// Initialize notebooks list
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await notebookView.refreshNotebookList();
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
});

// Export for global access
window.notebookView = notebookView;
window.vocabularyView = vocabularyView;