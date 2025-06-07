import {
  createElement,
  clearElement,
  removeAllChildren,
  getById,
} from "../utils/domUtils.js";
import { notebookModel } from "../models/notebookModel.js";
import { vocabularyView } from "./vocabularyView.js";
import {
  browserFile,
  getBrowsedFilePaths,
  clearBrowsedFilePaths,
} from "../utils/fileUtils.js";

class NotebookView {
  constructor() {
    this.noteBookViewer = getById("note-book-viewer");
    this.noteBookList = getById("note-book-list");
    this.newNoteBookForm = getById("newNoteBookForm");
    this.newNoteBookFormName = getById("newNoteBookForm_name");

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.newNoteBookForm.addEventListener("submit", (e) =>
      this.handleNewNotebookSubmit(e),
    );
  }

  async handleNewNotebookSubmit(e) {
    e.preventDefault();
    const filePaths = getBrowsedFilePaths();
    if (!filePaths.length) {
      alert("Please select PDF file. 🤔");
      return;
    }

    const name =
      this.newNoteBookFormName.value ||
      filePaths[0].split("/").at(-1).replace(".pdf", "");

    try {
      await notebookModel.createNotebook(name, filePaths);
      await this.refreshNotebookList();
      this.newNoteBookForm.reset();
      clearElement(getById("selected-file-path"));
    } catch (error) {
      alert("Error creating notebook: ".concat(error.message));
    } finally {
      clearBrowsedFilePaths();
    }
  }

  async showNotebook(notebookId) {
    const notebook = await notebookModel.getNotebookById(notebookId);
    if (!notebook) return;

    // Update selection highlight
    const prevSelected = this.noteBookList.querySelector(".notebook-selected");
    if (prevSelected) {
      prevSelected.classList.remove("notebook-selected");
    }

    const currentList = this.noteBookList.querySelector(
      `li[data-id='${notebookId}']`,
    );
    if (currentList) {
      currentList.classList.add("notebook-selected");
    }

    // Clear and update viewer
    removeAllChildren(this.noteBookViewer);

    // Create PDF viewers
    for (const pdfPath of notebook.files) {
      const pdfObject = createElement("object", {
        attributes: {
          data: pdfPath,
          type: "application/pdf",
          width: "100%",
          height: "100%",
        },
      });
      this.noteBookViewer.appendChild(pdfObject);
    }

    // Update vocabulary view
    await vocabularyView.showVocabularyList(notebookId);
  }

  async refreshNotebookList() {
    clearElement(this.noteBookList);
    const notebooks = await notebookModel.loadNotebooks();

    for (const notebook of notebooks) {
      const listItem = createElement("li", {
        className: "notebook",
        textContent: notebook.name,
        attributes: {
          "data-id": notebook.id,
        },
        listeners: {
          click: () => this.showNotebook(notebook.id),
          contextmenu: (e) => {
            e.preventDefault();
            notebookModel.deleteNotebook(notebook.id);
            this.refreshNotebookList();
            removeAllChildren(this.noteBookViewer);
            vocabularyView.clearVocabularyContainers();
          },
        },
      });

      this.noteBookList.appendChild(listItem);
    }
  }

  // File browser method exposed for global access
  static async handleFileBrowse() {
    return browserFile();
  }
}

export const notebookView = new NotebookView();
// Initialize browser function globally
window.browserFile = NotebookView.handleFileBrowse;
