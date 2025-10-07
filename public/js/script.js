const { ipcRenderer, desktopCapturer } = require('electron');
    let albums = [];
    let selectedAlbumIndex = null;
    let recordedChunks = [];
    let mediaRecorder = null;

    // Load albums on startup
    window.onload = () => {
      loadAlbums();
    };

    function loadAlbums() {
      ipcRenderer.invoke('get-albums').then(data => {
        albums = data;
        renderAlbums();
        document.getElementById('task-section').style.display = 'none';
      });
    }

    // Add album
    document.getElementById('album-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('album-name').value.trim();
      if (name) {
        ipcRenderer.invoke('add-album', name).then(data => {
          albums = data;
          renderAlbums();
          document.getElementById('album-name').value = '';
        });
      }
    });

    function renderAlbums() {
      // Show albums screen, hide task section
      document.getElementById('albums-screen').style.display = '';
      document.getElementById('task-section').style.display = 'none';

      const list = document.getElementById('album-list');
      list.innerHTML = '';
      albums.forEach((album, idx) => {
        const li = document.createElement('li');
        li.textContent = album.name;
        li.style.cursor = 'pointer';
        li.onclick = () => selectAlbum(idx);

        // Delete album button
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.style.marginLeft = 'auto';
        delBtn.onclick = (e) => {
          e.stopPropagation();
          if (confirm(`Delete album "${album.name}"?`)) {
            ipcRenderer.invoke('delete-album', idx).then(data => {
              albums = data;
              renderAlbums();
            });
          }
        };
        li.appendChild(delBtn);

        list.appendChild(li);
      });
    }

    function selectAlbum(idx) {
      selectedAlbumIndex = idx;
      // Hide albums screen, show task section
      document.getElementById('albums-screen').style.display = 'none';
      document.getElementById('task-section').style.display = '';
      document.getElementById('selected-album-title').textContent = albums[idx].name;
      renderTasks();
    }

    function renderTasks() {
      const list = document.getElementById('task-list');
      list.innerHTML = '';
      const tasks = albums[selectedAlbumIndex].tasks || [];
      tasks.forEach((task, tIdx) => {
        const li = document.createElement('li');

        // Editable priority dropdown
        const priorityColors = { '1': 'green', '2': 'orange', '3': 'red' };
        const prioSelect = document.createElement('select');
        prioSelect.className = 'priority-select';
        ['1', '2', '3'].forEach(val => {
          const opt = document.createElement('option');
          opt.value = val;
          opt.textContent = `${val} (${val === '1' ? 'Green' : val === '2' ? 'Yellow' : 'Red'})`;
          opt.style.color = priorityColors[val];
          if (task.priority === val) opt.selected = true;
          prioSelect.appendChild(opt);
        });
        prioSelect.style.background = priorityColors[task.priority] || 'gray';
        prioSelect.onchange = () => {
          ipcRenderer.invoke('update-task-priority', selectedAlbumIndex, tIdx, prioSelect.value).then(data => {
            albums = data;
            renderTasks();
          });
        };
        li.appendChild(prioSelect);

        if (task.type === 'photo') {
          const img = document.createElement('img');
          img.src = task.content;
          img.style.maxWidth = '120px';
          img.style.maxHeight = '120px';
          li.appendChild(img);
        } else if (task.type === 'voice') {
          const audio = document.createElement('audio');
          audio.src = task.content;
          audio.controls = true;
          li.appendChild(audio);
        } else {
          li.appendChild(document.createTextNode(task.content));
        }

        // Mark as Done button
        const doneBtn = document.createElement('button');
        doneBtn.textContent = 'Mark as Done';
        doneBtn.onclick = (e) => {
          e.stopPropagation();
          ipcRenderer.invoke('delete-task', selectedAlbumIndex, tIdx).then(data => {
            albums = data;
            renderTasks();
          });
        };
        li.appendChild(doneBtn);

        // Delete task button
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.onclick = (e) => {
          e.stopPropagation();
          if (confirm('Delete this task?')) {
            ipcRenderer.invoke('delete-task', selectedAlbumIndex, tIdx).then(data => {
              albums = data;
              renderTasks();
            });
          }
        };
        li.appendChild(delBtn);

        list.appendChild(li);
      });
    }

    // Dynamic task input fields
    document.getElementById('task-type').addEventListener('change', function() {
      const type = this.value;
      const container = document.getElementById('task-inputs');
      container.innerHTML = '';

      // Create priority select
      const prioritySelect = document.createElement('select');
      prioritySelect.id = 'task-priority';
      prioritySelect.required = true;
      prioritySelect.className = 'priority-select';
      prioritySelect.innerHTML = `
        <option value="" disabled selected>Priority</option>
        <option value="1" style="color:green;">1 (Green)</option>
        <option value="2" style="color:orange;">2 (Yellow)</option>
        <option value="3" style="color:red;">3 (Red)</option>
      `;

      if (type === 'text') {
        const flexDiv = document.createElement('div');
        flexDiv.className = 'input-flex';
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'task-content';
        input.placeholder = 'Task text';
        input.required = true;
        flexDiv.appendChild(input);
        flexDiv.appendChild(prioritySelect);
        container.appendChild(flexDiv);
      } else if (type === 'photo') {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'photo-file';
        fileInput.accept = 'image/*';

        const camBtn = document.createElement('button');
        camBtn.type = 'button';
        camBtn.id = 'cam-btn';
        camBtn.textContent = 'Take Photo from Camera';
        camBtn.className = 'action-btn';

        const img = document.createElement('img');
        img.id = 'photo-preview';
        img.style.maxWidth = '100px';
        img.style.display = 'none';

        const flexDiv = document.createElement('div');
        flexDiv.className = 'input-flex';
        flexDiv.appendChild(fileInput);
        flexDiv.appendChild(camBtn);
        flexDiv.appendChild(prioritySelect);

        container.appendChild(flexDiv);
        container.appendChild(img);

        fileInput.addEventListener('change', handlePhotoFile);
        camBtn.addEventListener('click', handleCameraPhoto);
      } else if (type === 'voice') {
        const recordBtn = document.createElement('button');
        recordBtn.type = 'button';
        recordBtn.id = 'record-btn';
        recordBtn.textContent = 'Record Voice Note';
        recordBtn.className = 'action-btn';

        const status = document.createElement('span');
        status.id = 'record-status';

        const audio = document.createElement('audio');
        audio.id = 'voice-preview';
        audio.controls = true;
        audio.style.display = 'none';

        const flexDiv = document.createElement('div');
        flexDiv.className = 'input-flex';
        flexDiv.appendChild(recordBtn);
        flexDiv.appendChild(prioritySelect);

        container.appendChild(flexDiv);
        container.appendChild(status);
        container.appendChild(audio);

        recordBtn.addEventListener('click', handleVoiceRecord);
      }
    });

    // Handle photo file selection
    function handlePhotoFile(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          document.getElementById('photo-preview').src = ev.target.result;
          document.getElementById('photo-preview').style.display = 'block';
          document.getElementById('photo-preview').dataset.base64 = ev.target.result;
        };
        reader.readAsDataURL(file);
      }
    }

    // Handle camera photo
    async function handleCameraPhoto() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      const canvas = document.createElement('canvas');
      document.body.appendChild(video);
      setTimeout(() => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        document.getElementById('photo-preview').src = dataUrl;
        document.getElementById('photo-preview').style.display = 'block';
        document.getElementById('photo-preview').dataset.base64 = dataUrl;
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(video);
      }, 1500);
    }

    // Handle voice recording
    async function handleVoiceRecord() {
      if (!mediaRecorder) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        recordedChunks = [];
        mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          document.getElementById('voice-preview').src = url;
          document.getElementById('voice-preview').style.display = 'block';
          document.getElementById('voice-preview').dataset.blob = url;
          document.getElementById('record-status').textContent = 'Recording stopped. Ready to save.';
        };
        mediaRecorder.start();
        document.getElementById('record-status').textContent = 'Recording... Click again to stop.';
      } else {
        mediaRecorder.stop();
        mediaRecorder = null;
      }
    }

    // Add task
    document.getElementById('task-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const type = document.getElementById('task-type').value;
      let content = '';
      if (type === 'text') {
        content = document.getElementById('task-content').value.trim();
      } else if (type === 'photo') {
        const preview = document.getElementById('photo-preview');
        content = preview && preview.dataset.base64 ? preview.dataset.base64 : '';
      } else if (type === 'voice') {
        const audio = document.getElementById('voice-preview');
        if (audio && audio.src) {
          // Save the audio blob as a file via main process
          const arrayBuffer = await fetch(audio.src).then(r => r.arrayBuffer());
          const buffer = Buffer.from(arrayBuffer);
          const filePath = await ipcRenderer.invoke('save-voice', buffer);
          content = filePath;
        }
      }
      const priority = document.getElementById('task-priority').value;
      if (type && content && priority) {
        ipcRenderer.invoke('add-task', selectedAlbumIndex, { type, content, priority }).then(data => {
          albums = data;
          renderTasks();
          document.getElementById('task-form').reset();
          document.getElementById('task-inputs').innerHTML = '';
        });
      }
    });

    document.getElementById('back-to-albums').onclick = () => {
      selectedAlbumIndex = null;
      // Show albums screen, hide task section
      document.getElementById('albums-screen').style.display = '';
      document.getElementById('task-section').style.display = 'none';
      renderAlbums();
    };
