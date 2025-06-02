const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/**ipc */

const notebookDataPath = path.join(__dirname, "./data/notebook.json");
const vocabraryDataPath = path.join(__dirname, "./data/vocabrary.json");

ipcMain.handle("show-file-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });

  if (!result.canceled) {
    return result.filePaths;
  }
  return null;
});

ipcMain.handle("load-notebook-data", async () => {
  const fileData = fs.readFileSync(notebookDataPath, "utf8");
  return fileData;
});

ipcMain.handle("load-vocabrary-data", async () => {
  const fileData = fs.readFileSync(vocabraryDataPath, "utf8");
  return fileData;
});

ipcMain.handle("write-vocabrary-data", (event, fileData) => {
  fs.writeFileSync(vocabraryDataPath, fileData);
  return true;
});

ipcMain.handle("write-notebook-data", (event, fileData) => {
  fs.writeFileSync(notebookDataPath, fileData);
  return true;
});
