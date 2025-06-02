// File utility functions
// This module provides utilities for file operations and data handling

let browsedFilePaths = [];

export async function browserFile() {
  const result = await window.electron.browserFile();
  if (result) {
    browsedFilePaths = result;
    updateSelectedFilePath(result);
    return result;
  }
  return [];
}

export function getBrowsedFilePaths() {
  return browsedFilePaths;
}

export function clearBrowsedFilePaths() {
  browsedFilePaths = [];
  updateSelectedFilePath([]);
}

export async function loadNotebookData() {
  try {
    return await window.electron.loadNotebookData();
  } catch (error) {
    console.error('Error loading notebook data:', error);
    return { notebooks: [] };
  }
}

export async function loadVocabularyData() {
  try {
    return await window.electron.loadVocabraryData();
  } catch (error) {
    console.error('Error loading vocabulary data:', error);
    return { vocabraries: [] };
  }
}

export async function writeVocabularyData(data) {
  try {
    await window.electron.writeVocabraryData(JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error writing vocabulary data:', error);
    return false;
  }
}

function updateSelectedFilePath(paths) {
  const element = document.getElementById("selected-file-path");
  if (element) {
    element.innerText = paths.join("\n");
  }
}