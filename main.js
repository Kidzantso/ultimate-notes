const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
const albumsFile = path.join(dataDir, 'albums.json');
const voicesDir = path.join(dataDir, 'voices');

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  if (!fs.existsSync(albumsFile)) fs.writeFileSync(albumsFile, '[]');
  if (!fs.existsSync(voicesDir)) fs.mkdirSync(voicesDir);
}

function readAlbums() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(albumsFile, 'utf-8'));
}

function writeAlbums(albums) {
  fs.writeFileSync(albumsFile, JSON.stringify(albums, null, 2));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.loadFile(path.join(__dirname, 'views', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers
ipcMain.handle('get-albums', () => {
  return readAlbums();
});

ipcMain.handle('add-album', (event, name) => {
  const albums = readAlbums();
  albums.push({ name, tasks: [] });
  writeAlbums(albums);
  return albums;
});

ipcMain.handle('add-task', (event, albumIndex, task) => {
  const albums = readAlbums();
  if (albums[albumIndex]) {
    albums[albumIndex].tasks = albums[albumIndex].tasks || [];
    albums[albumIndex].tasks.push(task);
    writeAlbums(albums);
  }
  return albums;
});

ipcMain.handle('save-voice', async (event, buffer) => {
  ensureDataFile();
  const filename = `voice_${Date.now()}.webm`;
  const filePath = path.join(voicesDir, filename);
  fs.writeFileSync(filePath, Buffer.from(buffer));
  return filePath;
});

ipcMain.handle('delete-album', (event, albumIndex) => {
  const albums = readAlbums();
  if (albums[albumIndex]) {
    albums.splice(albumIndex, 1);
    writeAlbums(albums);
  }
  return albums;
});

ipcMain.handle('delete-task', (event, albumIndex, taskIndex) => {
  const albums = readAlbums();
  if (albums[albumIndex] && albums[albumIndex].tasks && albums[albumIndex].tasks[taskIndex]) {
    albums[albumIndex].tasks.splice(taskIndex, 1);
    writeAlbums(albums);
  }
  return albums;
});

ipcMain.handle('update-task-priority', (event, albumIndex, taskIndex, newPriority) => {
  const albums = readAlbums();
  if (
    albums[albumIndex] &&
    albums[albumIndex].tasks &&
    albums[albumIndex].tasks[taskIndex]
  ) {
    albums[albumIndex].tasks[taskIndex].priority = newPriority;
    writeAlbums(albums);
  }
  return albums;
});