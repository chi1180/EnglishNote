const { app, BrowserWindow, dialog, ipcMain, screen } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
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

const userDataPath = app.getPath("userData");
const notebookDataPath = path.join(userDataPath, "notebook.json");
const vocabraryDataPath = path.join(userDataPath, "vocabulary.json");

if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

function initializeDataFilesSafe() {
  try {
    if (!fs.existsSync(notebookDataPath)) {
      fs.writeFileSync(notebookDataPath, '{"notebooks": []}');
    } else {
      const content = fs.readFileSync(notebookDataPath, "utf8").trim();
      if (content === "") {
        fs.writeFileSync(notebookDataPath, '{"notebooks": []}');
      }
    }

    if (!fs.existsSync(vocabraryDataPath)) {
      fs.writeFileSync(vocabraryDataPath, '{"vocabularies": []}');
    } else {
      const content = fs.readFileSync(vocabraryDataPath, "utf8").trim();
      if (content === "") {
        fs.writeFileSync(vocabraryDataPath, '{"vocabularies": []}');
      }
    }

    console.log("Data files initialized successfully");
  } catch (error) {
    console.error("Error initializing data files:", error);
  }
}

initializeDataFilesSafe();

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

ipcMain.handle("focus-on-main-window", () => {
  const mainWindow = BrowserWindow.getFocusedWindow();
  if (mainWindow) mainWindow.focus();
});
