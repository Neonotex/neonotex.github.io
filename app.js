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
const sourceCodeBtn = document.getElementById('sourceCodeBtn');

if (sourceCodeBtn) {
  sourceCodeBtn.onclick = () => {
    window.open('https://github.com/Neonotex/neonotex.github.io', '_blank');
  };
}


const todayContainer = document.getElementById('todayContainer');
const modal = document.getElementById('promiseModal');
const addBtn = document.getElementById('addBtn');
const backupModal = document.getElementById('backupModal');
const backupOpenBtn = document.getElementById('backupOpenBtn');
const closeBackupModal = document.getElementById('closeBackupModal');
const exportBackup = document.getElementById('exportBackup');
const importBackup = document.getElementById('importBackup');
const importFile = document.getElementById('importFile');
const accountsBtn = document.getElementById('accountsBtn');
const accountsModal = document.getElementById('accountsModal');
const createAccountModal = document.getElementById('createAccountModal');
const accountOptionsModal = document.getElementById('accountOptionsModal');
const addClientModal = document.getElementById('addClientModal');

const createAccountBtn = document.getElementById('createAccountBtn');
const accountsList = document.getElementById('accountsList');
const closeAccountsModal = document.getElementById('closeAccountsModal');

const newAccountName = document.getElementById('newAccountName');
const saveAccountBtn = document.getElementById('saveAccountBtn');
const cancelCreateAccountBtn = document.getElementById('cancelCreateAccountBtn');

const addClientBtn = document.getElementById('addClientBtn');
const viewAccountBtn = document.getElementById('viewAccountBtn');
const cancelAccountOptionsBtn = document.getElementById('cancelAccountOptionsBtn');
const clientNameInput = document.getElementById('clientNameInput');
const clientDescInput = document.getElementById('clientDescInput');
const saveClientBtn = document.getElementById('saveClientBtn');
const cancelAddClientBtn = document.getElementById('cancelAddClientBtn');

const saveBtn = document.getElementById('savePromise');
const closeModal = document.getElementById('closeModal');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const homeBtn = document.getElementById('homeBtn');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeHelpModal = document.getElementById('closeHelpModal');
const MAX_DONE = 15;
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const passwordToggle = document.getElementById('passwordToggle');

const appLockModal = document.getElementById('appLockModal');
const appPasswordInput = document.getElementById('appPasswordInput');
const unlockBtn = document.getElementById('unlockBtn');
const biometricBtn = document.getElementById('biometricBtn');

const APP_PASSWORD_KEY = 'neonote_app_password';
const PASSWORD_ENABLED_KEY = 'neonote_password_enabled';
const BIOMETRIC_ENABLED_KEY = 'neonote_biometric_enabled';



let searchClearTimer = null;
let currentTab = 'today';

const clientName = document.getElementById('clientName');
const promiseDate = document.getElementById('promiseDate');
const description = document.getElementById('description');


let editIndex = null;
let promises = JSON.parse(localStorage.getItem('neonote_promises') || '[]');
let isMoving = false;
let accounts = JSON.parse(localStorage.getItem('neonote_accounts') || '[]');
let currentAccountId = null;

function markOverduePromisesDone() {
  const todayStr = today();
  let changed = false;

  promises.forEach(p => {
    if (!p.done && p.date < todayStr) {
      p.done = true;
      changed = true;
    }
  });

  if (changed) save();
}

settingsBtn.onclick = () => {
  passwordToggle.checked =
    localStorage.getItem(PASSWORD_ENABLED_KEY) === 'true';

  settingsModal.classList.remove('hidden');
};

closeSettingsBtn.onclick = () => {
  settingsModal.classList.add('hidden');
};

passwordToggle.onchange = () => {
  if (passwordToggle.checked) {
    settingsModal.classList.add('hidden');
    passwordModalTitle.textContent = 'Create App Password';
    passwordInput.value = '';
    passwordModal.classList.remove('hidden');

    passwordConfirmBtn.onclick = () => {
      const pw = passwordInput.value.trim();
      if (!pw) return;

      localStorage.setItem(APP_PASSWORD_KEY, pw);
      localStorage.setItem(PASSWORD_ENABLED_KEY, 'true');

      passwordModal.classList.add('hidden');
    };
  } else {
    localStorage.removeItem(APP_PASSWORD_KEY);
    localStorage.setItem(PASSWORD_ENABLED_KEY, 'false');
    localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
  }
};


addClientBtn.onclick = () => {
  clientNameInput.value = '';
  clientDescInput.value = '';
  accountOptionsModal.classList.add('hidden');
  addClientModal.classList.remove('hidden');
};

viewAccountBtn.onclick = () => {
  accountOptionsModal.classList.add('hidden');
  showTemporaryAccountTab(currentAccountId);
};

cancelAccountOptionsBtn.onclick = () => {
  accountOptionsModal.classList.add('hidden');
};

helpBtn.onclick = () => {
  helpModal.classList.remove('hidden');
};

closeHelpModal.onclick = () => {
  helpModal.classList.add('hidden');
};

saveClientBtn.onclick = () => {
  const name = clientNameInput.value.trim();
  const desc = clientDescInput.value.trim();

  if (!name) return alert('Client name required');

  const acc = accounts.find(a => a.id === currentAccountId);
  if (!acc) return;

  acc.clients.push({
    id: 'cli_' + Date.now(),
    name,
    desc
  });

  localStorage.setItem('neonote_accounts', JSON.stringify(accounts));
  addClientModal.classList.add('hidden');
  showTemporaryAccountTab(currentAccountId);
};

cancelAddClientBtn.onclick = () => {
  addClientModal.classList.add('hidden');
};


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

  showConfirm(`Mark promise "${p.name}" as Done?`, () => {
    p.done = true;

    const idx = promises.indexOf(p);
    if (idx > -1) {
      promises.splice(idx, 1);
      promises.push(p); 
    }

    enforceDoneLimit();
    save();
    render();
  });
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

accountsBtn.onclick = () => {
  renderAccountsList();
  accountsModal.classList.remove('hidden');
};

closeAccountsModal.onclick = () => accountsModal.classList.add('hidden');

createAccountBtn.onclick = () => {
  newAccountName.value = '';
  createAccountModal.classList.remove('hidden');
};

cancelCreateAccountBtn.onclick = () => createAccountModal.classList.add('hidden');

saveAccountBtn.onclick = () => {
  const name = newAccountName.value.trim();
  if (!name || name.length > 10) {
    alert('Account name required (max 10 chars)');
    return;
  }

  const newAccount = {
    id: 'acc_' + Date.now(),
    name,
    clients: []
  };
  accounts.push(newAccount);
  localStorage.setItem('neonote_accounts', JSON.stringify(accounts));
  createAccountModal.classList.add('hidden');
  renderAccountsList();
};

function renderAccountsList() {
  accountsList.innerHTML = '';

  accounts.forEach(acc => {
    const div = document.createElement('div');
    div.className = 'promise';
    div.style.cursor = 'pointer';

    div.innerHTML = `
      <div class="promise-header">
        <strong>${acc.name}</strong>
        <button class="account-delete">❌</button>
      </div>
    `;

    div.onclick = () => {
      currentAccountId = acc.id;
      document.getElementById('accountOptionsTitle').textContent = acc.name;
      accountsModal.classList.add('hidden');
      accountOptionsModal.classList.remove('hidden');
    };

    div.querySelector('.account-delete').onclick = e => {
      e.stopPropagation();
      showConfirm('Delete this account and all its clients?', () => {
  accounts = accounts.filter(a => a.id !== acc.id);
  localStorage.setItem('neonote_accounts', JSON.stringify(accounts));
  renderAccountsList();
});

    };

    accountsList.appendChild(div);
  });
}



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
      promises,
      accounts
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
accounts = parsed.accounts || [];
save();  
localStorage.setItem('neonote_accounts', JSON.stringify(accounts)); 

markOverduePromisesDone();
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
const confirmModal = document.getElementById('confirmModal');
const confirmText = document.getElementById('confirmText');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

let confirmAction = null;


function showNotification(message) {
  notificationText.textContent = message;
  notificationModal.classList.remove('hidden');
}

function showConfirm(message, action) {
  confirmText.textContent = message;
  confirmAction = action;
  confirmModal.classList.remove('hidden');
}


notificationCloseBtn.onclick = () => {
  notificationModal.classList.add('hidden');
};

confirmYes.onclick = () => {
  if (confirmAction) confirmAction();
  confirmModal.classList.add('hidden');
  confirmAction = null;
};

confirmNo.onclick = () => {
  confirmModal.classList.add('hidden');
  confirmAction = null;
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
    currentTab === 'account'
      ? renderAccount(currentAccountId)
      : render();
    return;
  }

  if (currentTab === 'account') {
    const acc = accounts.find(a => a.id === currentAccountId);
    if (!acc) return;

    const filtered = acc.clients.filter(c =>
      c.name.toLowerCase().includes(q)
    );

    todayContainer.innerHTML = '';
    if (!filtered.length) {
      todayContainer.innerHTML =
        '<p class="empty-state">No matching clients</p>';
      return;
    }

    filtered.forEach(client => {
      const div = document.createElement('div');
      div.className = 'promise';
      div.innerHTML = `
        <div class="promise-header">
          <strong>${client.name}</strong>
        </div>
        <div class="promise-details">
          <p>${client.desc}</p>
        </div>
      `;
      div.querySelector('.promise-header').onclick = () =>
        div.classList.toggle('show');
      todayContainer.appendChild(div);
    });
  }

  else {
    const res = promises.filter(p =>
      p.name.toLowerCase().includes(q)
    );
    render(res, currentTab);
  }

  searchClearTimer = setTimeout(() => {
    searchInput.value = '';
    currentTab === 'account'
      ? renderAccount(currentAccountId)
      : render();
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

(function enforceAppLock() {
  const enabled =
    localStorage.getItem(PASSWORD_ENABLED_KEY) === 'true';

  if (!enabled) return;

  appLockModal.classList.remove('hidden');

  if (localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true') {
    biometricBtn.classList.remove('hidden');
  }
})();

unlockBtn.onclick = () => {
  const saved = localStorage.getItem(APP_PASSWORD_KEY);
  if (appPasswordInput.value === saved) {
    appLockModal.classList.add('hidden');
    appPasswordInput.value = '';
  }
};

biometricBtn.onclick = async () => {
  if (!window.PublicKeyCredential) {
    alert('Biometrics not supported');
    return;
  }

  localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
  appLockModal.classList.add('hidden');
};


markOverduePromisesDone();
render();


function showTemporaryAccountTab(accId) {
  const acc = accounts.find(a => a.id === accId);
  if (!acc) return;

  const existing = document.querySelector('.tab.temp-account');
  if (existing) existing.remove();

  const tabs = document.querySelector('.tabs');
  const allTab = tabs.querySelector('[data-tab="all"]');

  const tab = document.createElement('button');
  tab.className = 'tab temp-account active';
  tab.textContent = acc.name;
  tab.dataset.tab = 'account';

  tabs.insertBefore(tab, allTab);

  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  currentTab = 'account';

  renderAccount(accId);

  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = 'account';
    renderAccount(accId);
  };
}

function renderAccount(accId) {
  todayContainer.innerHTML = '';
  const acc = accounts.find(a => a.id === accId);
  if (!acc || !acc.clients.length) {
    todayContainer.innerHTML = '<p class="empty-state">No clients yet. Add some!</p>';
    return;
  }

  acc.clients.forEach(client => {
    const div = document.createElement('div');
    div.className = 'promise';
    div.innerHTML = `
      <div class="promise-header">
        <strong>${client.name}</strong>
       <button class="delete-client">❌</button>
      </div>
      <div class="promise-details">
        <p>${client.desc}</p>
      </div>
    `;
    div.querySelector('.promise-header').onclick = () => {
      div.classList.toggle('show');
    };
    div.querySelector('.delete-client').onclick = e => {
      e.stopPropagation();
      showConfirm('Delete this client?', () => {
  acc.clients = acc.clients.filter(c => c.id !== client.id);
  localStorage.setItem('neonote_accounts', JSON.stringify(accounts));
  renderAccount(accId);
});

    };
    todayContainer.appendChild(div);
  });
}


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

const hideBtn = document.getElementById('hideBtn');
let hidden = false;

hideBtn.onclick = () => {
  hidden = !hidden;

  const floatingButtons = document.querySelectorAll('.floating-btn:not(.hide-btn)');

  if (hidden) {
    floatingButtons.forEach(btn => btn.classList.add('slide-out'));

    hideBtn.classList.add('slide-right');
    hideBtn.classList.remove('slide-left');
    hideBtn.textContent = '❮'; 
  } else {

    floatingButtons.forEach(btn => btn.classList.remove('slide-out'));
    hideBtn.classList.add('slide-left');
    hideBtn.classList.remove('slide-right');
    hideBtn.textContent = '❯'; 
  }
};


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

});
