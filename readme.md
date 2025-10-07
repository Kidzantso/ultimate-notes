# Ultimate Notes

A simple Electron-based desktop app for organizing albums and tasks, with support for text, photo, and voice note tasks, all stored locally as JSON.

## Features

- **Albums:**  
  - Create and delete albums.
  - Each album contains its own set of tasks.

- **Tasks:**  
  - Add tasks as text, photo (from file or camera), or voice note (recorded).
  - Each task has an editable priority (1/2/3: green/yellow/red).
  - Delete tasks or mark them as done (which also deletes them).

- **Screens:**  
  - Two-screen navigation:  
    - Album list screen (shows all albums, add/delete albums).
    - Album detail screen (shows tasks for selected album, add/delete/mark tasks, back to albums).

- **Storage:**  
  - All data is stored locally in the `data/albums.json` file.
  - Voice notes are saved as files in `data/voices/`.

- **UI:**  
  - Modern, clean CSS with styled buttons and clear separation between controls.
  - Priority is color-coded and can be changed after task creation.

## How to Use

1. **Install dependencies:**
   ```
   npm install
   ```

2. **Start the app:**
   ```
   npm start
   ```

3. **Create albums** from the main screen.

4. **Click an album** to view/add tasks.

5. **Add tasks** as text, photo, or voice note, and set their priority.

6. **Edit priority** of any task using the dropdown.

7. **Delete or mark tasks as done** using the respective buttons.

8. **Go back to albums** using the "Back to Albums" button.

## Project Structure

```
ultimate-notes/
│
├── main.js
├── package.json
├── readme.md
├── data/
│   ├── albums.json
│   └── voices/
├── public/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── script.js
└── views/
    └── index.html
```

## Notes

- All data is stored locally; nothing is uploaded or synced.
- Photos are stored as base64 in JSON; voice notes are saved as files.
- The app is designed for desktop use with Electron.
