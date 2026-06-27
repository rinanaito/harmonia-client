/* ══════════════════════════════
   HARMONIA LANGUAGE LAB — APP JS
══════════════════════════════ */
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
    getDatabase, ref, onValue, get, query, startAt, endAt, orderByKey, orderByChild, equalTo, limitToFirst
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyBRFoBs5gr0QZMaIFbfKZmGIod_w_wEqm8",
    authDomain: "harmonia-playground.firebaseapp.com",
    databaseURL: "https://harmonia-playground-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "harmonia-playground",
    storageBucket: "harmonia-playground.firebasestorage.app",
    messagingSenderId: "260244666959",
    appId: "1:260244666959:web:82256bf89f165755abc83a"
};
export let db = null;
export let student = null;
export let folders = [];
export let medias = [];
export let files = [];

/* ══════════════════════════════
   HARMONIA LANGUAGE LAB — Screen JS
══════════════════════════════ */

/* ── Login: search action ── */
document.getElementById('search-btn').onclick = doSearch;
function doSearch() {
    const code = document.getElementById('student-id').value.trim().toLowerCase();
    if(code=== "") return;
    if(code !== student?.code) {
        student = null;
        medias = null;
        document.getElementById('search-btn').innerHTML = '<div class="spinner"></div>';
        searchStudent(code, (data) => {
            if(student != null){
                document.getElementById('student-id').value = '';
                renderFolders("");
            }
            document.getElementById('search-btn').innerHTML = 'Search';
        }).then();
    } else {
        renderFolders(code);
    }
}
function keys(data){
    return Object.keys(data);
}
async function searchStudent(code, callback) {
    if (db == null) {
        db = await getDatabase(initializeApp(firebaseConfig));
    }
    const snap = await get(query(ref(db, 'students'), orderByChild('code'), equalTo(code), limitToFirst(1)));
    if (snap.exists()){
        const data = snap.val();
        const key = keys(data);
        if(key.length > 0) {
            student = Object.values(data)[0];
            student.key = key[0];
            if(keys(folders).length === 0){
                await getFolders();
            }
            if(keys(files).length === 0){
                await getFiles();
            }
            await getStudentMedias();
            callback(student);
            return;
        }
    }
    callback(null);
}

async function getFolders() {
    const snap = await get(query(ref(db, 'albums')));
    if (snap.exists()){
        folders = snap.val();
    }
}
async function getFiles() {
    const snap = await get(query(ref(db, 'files')));
    if (snap.exists()){
        files = snap.val();
    }
}
async function getStudentMedias() {
    const filter = student.key + "++++++";
    const snap = await get(query(ref(db, 'medias'), orderByKey(), startAt(filter), endAt(filter + "\uf8ff")));
    if (snap.exists()){
        medias = snap.val();
    }
}

/* ── Folders: render a folder ── */
function renderFolders(code) {
    navigate('screen-folders', 'screen-login');
    if(code === student?.code) {
        return;
    }
    document.getElementById('folders-student-name').innerHTML = student.name;
    const renderFolders = [...new Set(Object.values(medias))];
    const key = keys(folders);
    let studentFolders = [];
    let mediaKeys = keys(medias);
    renderFolders.forEach(f => {
        let folder = folders[f];
        folder.key = f;
        let studentFiles = [];
        mediaKeys.forEach(m => {
            if(medias[m] === f) {
                let fileKey = m.split("++++++")[1];

                let file = files[fileKey];
                studentFiles.push({
                    key: fileKey,
                    name: file.name,
                    type: file.type,
                });
            }
        });
        folder.files = studentFiles
        studentFolders.push(folders[f]);
    })
    studentFolders.sort((a,b) => (b.name > a.name ? 1 : -1));

    const container = document.getElementById('folders-content');
    container.innerHTML = '';
    studentFolders.forEach(folder => {
        const el = document.createElement('div');
        el.className = 'folder-item';
        el.dataset.id = folder.key;
        el.innerHTML = `
          <div class="folder-header" onclick="toggleFolder(this)">
            <div class="folder-icon-wrap">
              <svg width="22" height="19" viewBox="0 0 48 42" fill="none">
                <path d="M2 9C2 6.79 3.79 5 6 5H18.5C19.56 5 20.57 5.42 21.33 6.17L23.5 8H42C44.21 8 46 9.79 46 12V36C46 38.21 44.21 40 42 40H6C3.79 40 2 38.21 2 36V9Z" fill="#FFD52AEC"/>
                <path d="M2 9C2 6.79 3.79 5 6 5H18.5C19.56 5 20.57 5.42 21.33 6.17L23.5 8H42" stroke="#c9980a" stroke-width="1.3" opacity="0.65" stroke-linecap="round"/>
                <path d="M10 22H38M10 28H28" stroke="rgba(255,255,255,0.12)" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="folder-info">
              <div class="folder-name">${folder.name}</div>
              <div class="folder-meta">${folder.files.length} item${folder.files.length !== 1 ? 's' : ''}</div>
            </div>
            <div class="folder-chevron">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
          <div class="folder-content">
            <div class="folder-divider"></div>

    <div class="photos-content">
      <div class="photo-grid" id="photo-grid">
              ${folder.files.map((file, idx) => `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div class="photo-item" onclick="openLightbox('${file.key}', '${file.type}')">
            <div class="photo-overlay"></div>
                  <img  style="display: block; margin: auto" 
                                              src="https://lh3.googleusercontent.com/d/${file.key}=w300" alt="${file.name}"/>
            <span class="photo-badge">${file.type}</span>
          </div>
          <p class="photo-name">${file.name}</p>
        </div>
     
              `).join('')}
      </div>
      </div>
          </div>
        `;
        container.appendChild(el);
    });
}


/* ── Keyboard shortcuts ── */
document.addEventListener('DOMContentLoaded', () => {
    // Enter key on login input
    document.getElementById('student-id').addEventListener('keydown', e => {
        if (e.key === 'Enter') doSearch();
    });

    // Escape to close lightbox
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeLightbox();
    });
});
