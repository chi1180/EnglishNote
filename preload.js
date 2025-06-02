const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  browserFile: async () => {
    const filePaths = await ipcRenderer.invoke("show-file-dialog");
    if (filePaths) {
      console.log("Chosen file's absolute path:", JSON.stringify(filePaths));
      return filePaths;
    }
  },
  loadNotebookData: async () => {
    const fileData = await ipcRenderer.invoke("load-notebook-data");
    if (fileData) {
      return fileData;
    }
  },
  loadVocabraryData: async () => {
    const fileData = await ipcRenderer.invoke("load-vocabrary-data");
    if (fileData) {
      return fileData;
    }
  },
  writeVocabraryData: async (fileData) => {
    await ipcRenderer.invoke("write-vocabrary-data", fileData);
  },
  writeNotebookData: async (fileData) => {
    await ipcRenderer.invoke("write-notebook-data", fileData);
  },
  focusOnMainWindow: async () => {
    await ipcRenderer.invoke("focus-on-main-window");
  },
});
