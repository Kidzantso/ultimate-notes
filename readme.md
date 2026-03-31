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
  <img width="1353" height="855" alt="image" src="https://github.com/user-attachments/assets/c5a1334d-9832-41dc-984d-8e19cd7b27dd" />
  
  - Album detail screen (shows tasks for selected album, add/delete/mark tasks, back to albums).
    
  <img width="1083" height="686" alt="image" src="https://github.com/user-attachments/assets/c581a65d-412b-4089-8d66-34f0984ee4d1" />
  <img width="1079" height="675" alt="image" src="https://github.com/user-attachments/assets/3fea3b7f-0368-4149-9a6a-89fde9448eb7" />
  <img width="1078" height="681" alt="Screenshot 2026-03-31 044230" src="https://github.com/user-attachments/assets/6b865ca6-a482-4ede-aba0-15f473d4e634" />
  <img width="1080" height="686" alt="image" src="https://github.com/user-attachments/assets/3e9d60d8-33c1-430e-96f5-f5ebfe54c180" />

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
