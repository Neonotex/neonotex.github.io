document.addEventListener('DOMContentLoaded', () => {

document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t =>
      t.classList.remove('active')
    );

    tab.classList.add('active');
    currentTab = tab.dataset.tab;
    render();
  };
});

const todayContainer = document.getElementById('todayContainer');
const modal = document.getElementById('promiseModal');
const addBtn = document.getElementById('addBtn');
const backupModal = document.getElementById('backupModal');
const backupOpenBtn = document.getElementById('backupOpenBtn');
const closeBackupModal = document.getElementById('closeBackupModal');
const exportBackup = document.getElementById('exportBackup');
const importBackup = document.getElementById('importBackup');
const importFile = document.getElementById('importFile');
const saveBtn = document.getElementById('savePromise');
const closeModal = document.getElementById('closeModal');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const homeBtn = document.getElementById('homeBtn');
const MAX_DONE = 50;


let searchClearTimer = null;
let currentTab = 'today';

const clientName = document.getElementById('clientName');
const promiseDate = document.getElementById('promiseDate');
const description = document.getElementById('description');


let editIndex = null;
let promises = JSON.parse(localStorage.getItem('neonote_promises') || '[]');
let isMoving = false;


function today() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function getKey(password, salt) {
  const enc = new TextEncoder();

  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function render(list = promises, mode = currentTab) {
  todayContainer.innerHTML = '';

  let items = [];

  if (mode === 'today') {
    items = list.filter(p => p.date === today() && !p.done);
  }

  if (mode === 'all') {
    items = list.filter(p => !p.done);
  }

  if (mode === 'done') {
    items = list.filter(p => p.done);
  }

  if (!items.length) {
    todayContainer.innerHTML =
  '<p class="empty-state">Wala kay promise karon Dong! Pag trabaho intawon!</p>';
    return;
  }

  items.forEach(p => {
    const div = document.createElement('div');
    div.className = 'promise';
    if (p.done) div.classList.add('done-visible');

    div.innerHTML = `
      <div class="promise-header">
        <strong>${p.name}</strong>
        ${
          mode === 'today'
            ? '<div class="checkbox"></div>'
            : ''
        }
      </div>
      <div class="promise-details">
        <p>Date: ${p.date}</p>
        <p>${p.desc}</p>
        ${
          !p.done && mode !== 'done'
            ? '<button class="move">Move Promise</button>'
            : ''
        }
      </div>
    `;

    if (mode === 'today') {
      div.querySelector('.checkbox').onclick = e => {
        e.stopPropagation();
        p.done = true;
        const idx = promises.indexOf(p);
     if (idx > -1) {
        promises.splice(idx, 1);
        promises.push(p);
      }
        enforceDoneLimit();
        save();
        render();
      };
    }

    div.querySelector('.promise-header').onclick = () => {
      div.classList.toggle('show');
    };

    const moveBtn = div.querySelector('.move');
    if (moveBtn) {
      moveBtn.onclick = e => {
        e.stopPropagation();
        editIndex = promises.indexOf(p);
        isMoving = true;
        openModal(p);
      };
    }

    todayContainer.appendChild(div);
  });
}


function openModal(p = {}) {
  modal.classList.remove('hidden');
  clientName.value = p.name || '';
  promiseDate.value = p.date || today();
  description.value = p.desc || '';
}

function close() {
  modal.classList.add('hidden');
  editIndex = null;
}

function save() {
  localStorage.setItem('neonote_promises', JSON.stringify(promises));
}

addBtn.onclick = () => openModal();
closeModal.onclick = close;

backupOpenBtn.onclick = () => {
  backupModal.classList.remove('hidden');
};

closeBackupModal.onclick = () => {
  backupModal.classList.add('hidden');
};


const passwordModal = document.getElementById('passwordModal');
const passwordInput = document.getElementById('passwordInput');
const passwordConfirmBtn = document.getElementById('passwordConfirmBtn');
const passwordCancelBtn = document.getElementById('passwordCancelBtn');
const passwordModalTitle = document.getElementById('passwordModalTitle');

let backupAction = null; 
let backupFile = null;

exportBackup.onclick = () => {
  backupAction = 'export';
  passwordModalTitle.textContent = 'Set Backup Password';
  passwordInput.value = '';
  passwordModal.classList.remove('hidden');
};

importBackup.onclick = () => {
  importFile.click(); 
};

importFile.onchange = e => {
  backupFile = e.target.files[0];
  if (!backupFile) return;

  backupAction = 'import';
  passwordModalTitle.textContent = 'Enter Backup Password';
  passwordInput.value = '';
  passwordModal.classList.remove('hidden');
};

passwordConfirmBtn.onclick = async () => {
  const password = passwordInput.value.trim();
  if (!password) return;

  if (backupAction === 'export') {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getKey(password, salt);

    const payload = JSON.stringify({
      version: 1,
      created: Date.now(),
      promises
    });

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(payload)
    );

    const blob = new Blob([salt, iv, new Uint8Array(encrypted)]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'neonotex-backup.neonotex';
    a.click();

  } else if (backupAction === 'import' && backupFile) {
    const buffer = await backupFile.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    const salt = bytes.slice(0, 16);
    const iv = bytes.slice(16, 28);
    const data = bytes.slice(28);

    try {
      const key = await getKey(password, salt);
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      const parsed = JSON.parse(new TextDecoder().decode(decrypted));
      promises = parsed.promises || [];
      save();
      render();
      backupModal.classList.add('hidden');
      showNotification('Backup restored successfully'); 
    } catch {
      showNotification('Invalid password or corrupted backup'); 
    }
  }

  passwordModal.classList.add('hidden');
};

passwordCancelBtn.onclick = () => {
  passwordModal.classList.add('hidden');
  backupFile = null;
};


const notificationModal = document.getElementById('notificationModal');
const notificationText = document.getElementById('notificationText');
const notificationCloseBtn = document.getElementById('notificationCloseBtn');

function showNotification(message) {
  notificationText.textContent = message;
  notificationModal.classList.remove('hidden');
}

notificationCloseBtn.onclick = () => {
  notificationModal.classList.add('hidden');
};


saveBtn.onclick = () => {
  const existing = editIndex !== null ? promises[editIndex] : null;

  const p = {
    name: clientName.value.trim(),
    date: promiseDate.value,
    desc: description.value.trim(),
    done: existing ? existing.done : false
  };

  if (!p.name) return;

  if (editIndex !== null) {
    promises[editIndex] = p;
  } else {
    promises.push(p);
  }
  enforceDoneLimit();
  save();
  close();


  isMoving = false;
  render(promises, 'today');
};

searchInput.oninput = () => {
  const q = searchInput.value.toLowerCase();

  if (searchClearTimer) clearTimeout(searchClearTimer);

  if (!q) {
    render();
    return;
  }

  const res = promises.filter(p =>
    p.name.toLowerCase().includes(q)
  );

  render(res, currentTab);

  searchClearTimer = setTimeout(() => {
    searchInput.value = '';
    render();
  }, 10000);
};


clearSearchBtn.onclick = () => {
  searchInput.value = '';
  render(promises, 'today');
};

homeBtn.onclick = () => {
  location.reload();
};

let deferredPrompt;
const installBanner = document.getElementById('installBanner');
const installBtn = document.getElementById('installBtn');
const dismissBtn = document.getElementById('dismissBtn');

function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (!isAppInstalled()) {
    installBanner.classList.remove('hidden');
  }
});

installBtn.onclick = async () => {
  installBanner.classList.add('hidden');
  deferredPrompt.prompt();

  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
};

dismissBtn.onclick = () => {
  installBanner.classList.add('hidden');
};

if (isAppInstalled()) {
  installBanner.classList.add('hidden');
}

render();

function adjustPromiseSectionHeight() {
  const promiseSection = document.getElementById('promiseSection');
  const floatingBtns = document.querySelectorAll('.floating-btn');
  
  let minBtnTop = Infinity;
  floatingBtns.forEach(btn => {
    const rect = btn.getBoundingClientRect();
    if (rect.top < minBtnTop) minBtnTop = rect.top;
  });

  const safeMaxHeight = minBtnTop - 16; 
  promiseSection.style.maxHeight = safeMaxHeight + 'px';
  promiseSection.style.minHeight = safeMaxHeight * 0.95 + 'px';
}
adjustPromiseSectionHeight();
window.addEventListener('resize', adjustPromiseSectionHeight);
window.addEventListener('orientationchange', adjustPromiseSectionHeight);


function enforceDoneLimit() {
  const doneIndexes = promises
    .map((p, i) => (p.done ? i : -1))
    .filter(i => i !== -1);

  if (doneIndexes.length <= MAX_DONE) return;

  const excess = doneIndexes.length - MAX_DONE;

  for (let i = 0; i < excess; i++) {
    promises.splice(doneIndexes[i] - i, 1);
  }
}


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

});
