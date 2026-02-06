document.addEventListener('DOMContentLoaded', () => {
  loadUpdateDetails();

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

const updateBanner = document.getElementById('updateBanner');
const applyUpdateBtn = document.getElementById('applyUpdate');

const viewUpdateDetailsBtn = document.getElementById('viewUpdateDetails');

const updateDetailsModal = document.getElementById('updateDetailsModal');
const closeUpdateDetails = document.getElementById('closeUpdateDetails');


let newWorker = null;
let updateApproved = false;

navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (updateApproved) {
    window.location.reload();
  }
});


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').then(reg => {

    if (reg.waiting) {
      newWorker = reg.waiting;
      updateBanner.classList.remove('hidden');
    }

    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;

      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          newWorker = worker;
          updateBanner.classList.remove('hidden');
        }
      });
    });
  });
}

const todayContainer = document.getElementById('todayContainer');
const countTodayEl = document.getElementById('countToday');
const countAllEl = document.getElementById('countAll');
const countAccountEl = document.getElementById('countAccount');

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
const NAME_HISTORY_KEY = 'neonote_name_history';
const nameSuggestions = document.getElementById('nameSuggestions');
const noNoteModal = document.getElementById('noNoteModal');
const closeNoNoteModal = document.getElementById('closeNoNoteModal');

closeNoNoteModal.onclick = () => {
  noNoteModal.classList.add('hidden');
};


let searchClearTimer = null;
let currentTab = 'today';

const clientName = document.getElementById('clientName');
const promiseDate = document.getElementById('promiseDate');
const description = document.getElementById('description');

clientName.addEventListener('input', () => {
  showNameSuggestions(clientName.value.trim());
});

const NOTES_KEY = 'neonote_notes';
const NOTE_LIMIT = 20000;
const NOTE_TITLE_LIMIT = 100;


let notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
let currentNoteId = null;


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

  currentTab = 'account';
  document.getElementById('allStickyHeader').classList.add('hidden');

  showTemporaryAccountTab(currentAccountId);
  updateCounts();
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

  clientNameInput.value = '';
  clientDescInput.value = '';

  showTemporaryAccountTab(currentAccountId);
  updateCounts();
  clientNameInput.focus();
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

function updateCounts() {
  const todayCount = promises.filter(
    p => p.date === today() && !p.done
  ).length;

  const allCount = promises.filter(p => !p.done).length;

  let accountCount = 0;
  if (currentAccountId) {
    const acc = accounts.find(a => a.id === currentAccountId);
    if (acc && acc.clients) {
      accountCount = acc.clients.length;
    }
  }

  if (countTodayEl) countTodayEl.textContent = `Today [${todayCount}]`;
  if (countAllEl) countAllEl.textContent = `All [${allCount}]`;
  if (countAccountEl) countAccountEl.textContent = `Account [${accountCount}]`;
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
const allHeader = document.getElementById('allStickyHeader');

if (mode === 'all') {
  allHeader.classList.remove('hidden');
} else {
  allHeader.classList.add('hidden');
}

  let items = [];

  if (mode === 'today') {
    items = list.filter(p => p.date === today() && !p.done);
  }

  if (mode === 'all') {
  items = list
    .filter(p => !p.done)
    .sort((a, b) => a.date.localeCompare(b.date));
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
<div class="promise-header ${mode === 'all' ? 'all-row' : ''}">
  ${
    mode === 'all'
      ? `
        <div class="all-name-box">${p.name}</div>
        <div class="all-date-box">${p.date}</div>
      `
      : `
        <strong>${p.name}</strong>
        ${mode === 'today' ? '<div class="checkbox"></div>' : ''}
      `
  }
</div>

<div class="promise-details">
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
    updateCounts();
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

function getNameHistory() {
  return JSON.parse(localStorage.getItem(NAME_HISTORY_KEY) || '[]');
}

function saveNameToHistory(name) {
  if (!name) return;

  let history = getNameHistory();

  if (!history.includes(name)) {
    history.push(name);
    localStorage.setItem(NAME_HISTORY_KEY, JSON.stringify(history));
  }
}

function showNameSuggestions(query) {
  const history = getNameHistory();
  nameSuggestions.innerHTML = '';

  if (!query) {
    nameSuggestions.classList.add('hidden');
    return;
  }

  const matches = history.filter(n =>
    n.toLowerCase().includes(query.toLowerCase())
  );

  if (!matches.length) {
    nameSuggestions.classList.add('hidden');
    return;
  }

  matches.forEach(name => {
    const div = document.createElement('div');
    div.textContent = name;
    div.onclick = () => {
      clientName.value = name;
      nameSuggestions.classList.add('hidden');
    };
    nameSuggestions.appendChild(div);
  });

  nameSuggestions.classList.remove('hidden');
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
      accounts,
      nameHistory: getNameHistory(),
      notes,
      collectionData,     
      quotaData,
      monthlyAccountCounts
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
notes = parsed.notes || [];
collectionData = parsed.collectionData || [];
quotaData = parsed.quotaData || {};
monthlyAccountCounts = parsed.monthlyAccountCounts || {}; 
localStorage.setItem('collectionData', JSON.stringify(collectionData));
localStorage.setItem('collectionQuotaData', JSON.stringify(quotaData));
localStorage.setItem('monthlyAccountCounts', JSON.stringify(monthlyAccountCounts)); 
localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
if (parsed.nameHistory) {
  localStorage.setItem(NAME_HISTORY_KEY, JSON.stringify(parsed.nameHistory));
}
save();  
localStorage.setItem('neonote_accounts', JSON.stringify(accounts)); 

markOverduePromisesDone();
render();
updateCounts();
restoreCollectionUI();  
renderCollectionNames();

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
    saveNameToHistory(p.name); 
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
  const res = promises.filter(p => {
    const nameMatch = p.name.toLowerCase().includes(q);

    const dateMatch =
      currentTab === 'all' &&
      p.date.includes(q); 

    return nameMatch || dateMatch;
  });

  render(res, currentTab);
}


if (currentTab !== 'all') {
  searchClearTimer = setTimeout(() => {
    searchInput.value = '';
    currentTab === 'account'
      ? renderAccount(currentAccountId)
      : render();
  }, 10000);
}

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
  document.getElementById('allStickyHeader').classList.add('hidden');
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

applyUpdateBtn.onclick = () => {
  if (!newWorker) return;

  updateApproved = true;
  newWorker.postMessage({ action: 'APPLY_UPDATE' });
};


async function loadUpdateDetails() {
  try {
    const res = await fetch('./update-info.json', {
      cache: 'no-store'
    });

    if (!res.ok) throw new Error('Failed to load update info');

    const data = await res.json();

    document.getElementById('updateTitle').textContent =
      `Update ${data.version}`;

    const list = document.getElementById('updateDetailsList');
    list.innerHTML = '';

    data.details.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });

  } catch (e) {
    document.getElementById('updateDetailsList').innerHTML =
      '<li>Unable to load update details</li>';
  }
}


viewUpdateDetailsBtn.onclick = () => {
  loadUpdateDetails(); 
  updateDetailsModal.classList.remove('hidden');
};

closeUpdateDetails.onclick = () => {
  updateDetailsModal.classList.add('hidden');
};

const notepadBtn = document.getElementById('notepadBtn');
const notepadModal = document.getElementById('notepadModal');
const closeNotepad = document.getElementById('closeNotepad');

const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const charCount = document.getElementById('charCount');

const notesList = document.getElementById('notesList');
const addNoteBtn = document.getElementById('addNoteBtn');
const toggleNotes = document.getElementById('toggleNotes');
const sidebar = document.querySelector('.notepad-sidebar');

function saveNotes() {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function renderNotesList() {
  notesList.innerHTML = '';

  if (!notes.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No notes yet. Add one!';
    notesList.appendChild(empty);
    return;
  }

  notes.forEach(n => {
    const div = document.createElement('div');
    div.className = 'promise';
    div.style.cursor = 'pointer';

    div.innerHTML = `
      <div class="promise-header" style="display: flex; justify-content: space-between; align-items: center;">
        <strong>${n.title || 'Untitled'}</strong>
        <button class="delete-client" style="
          width: 32px;
          height: 32px;
          min-width: 32px;
          min-height: 32px;
          max-width: 32px;
          max-height: 32px;
          padding: 0;
          margin: 0;
          font-size: 18px;
          display: flex;
          justify-content: center;
          align-items: center;
        ">❌</button>
      </div>
    `;

    div.querySelector('.promise-header').onclick = e => {
      if (e.target.classList.contains('delete-client')) return;
      loadNote(n.id);
    };

    div.querySelector('.delete-client').onclick = e => {
      e.stopPropagation();

      showConfirm('Are you sure you want to delete this note?', () => {
        notes = notes.filter(x => x.id !== n.id);
        if (currentNoteId === n.id) clearEditor();
        saveNotes();
        renderNotesList();
      });
    };

    notesList.appendChild(div);
  });
}


function loadNote(id) {
  const n = notes.find(x => x.id === id);
  if (!n) return;

  currentNoteId = id;
  noteTitle.value = n.title;
  noteContent.value = n.content;
  updateCharCount();
}

function clearEditor() {
  currentNoteId = null;
  noteTitle.value = '';
  noteContent.value = '';
  updateCharCount();
}

function updateCharCount() {
  const len = noteContent.value.length;
  charCount.textContent = `${len} / ${NOTE_LIMIT}`;

  if (len > NOTE_LIMIT) {
    noteContent.value = noteContent.value.slice(0, NOTE_LIMIT);
  }
}


noteTitle.oninput = (e) => {
  if (!currentNoteId) {
    noNoteModal.classList.remove('hidden');
    e.target.value = '';
    return;
  }

  if (e.target.value.length > NOTE_TITLE_LIMIT) {
    e.target.value = e.target.value.slice(0, NOTE_TITLE_LIMIT);
  }

  const n = notes.find(x => x.id === currentNoteId);
  if (!n) return;

  n.title = e.target.value;
  saveNotes();
};

noteContent.oninput = (e) => {
  if (!currentNoteId) {
    noNoteModal.classList.remove('hidden');
    e.target.value = '';
    updateCharCount();
    return;
  }

  updateCharCount();

  const n = notes.find(x => x.id === currentNoteId);
  if (!n) return;

  n.content = e.target.value.slice(0, NOTE_LIMIT);
  saveNotes();
};


addNoteBtn.onclick = () => {
  const n = {
    id: 'note_' + Date.now(),
    title: '',
    content: ''
  };
  notes.unshift(n);
  saveNotes();
  renderNotesList();
  loadNote(n.id);
};

toggleNotes.onclick = () => {
  sidebar.classList.toggle('collapsed');
  toggleNotes.textContent =
    sidebar.classList.contains('collapsed') ? '❯' : '❮';
  addNoteBtn.classList.toggle('hidden');
};

notepadBtn.onclick = () => {
  notepadModal.classList.remove('hidden');
  renderNotesList();
};

closeNotepad.onclick = () => {
  notepadModal.classList.add('hidden');
};

const collectionBtn = document.getElementById('collectionBtn');
const collectionModal = document.getElementById('collectionModal');
const closeCollectionModal = document.getElementById('closeCollectionModal');
const copyCollectionBtn = document.getElementById('copyCollectionBtn');


const expandPanelBtn = document.getElementById('expandPanelBtn');
const panelContent = document.getElementById('panelContent');

const collectionSearch = document.getElementById('collectionSearch');
const collectionName = document.getElementById('collectionName');
const collectionBalance = document.getElementById('collectionBalance');
const collectionDate = document.getElementById('collectionDate');
const collectionLastPaid = document.getElementById('collectionLastPaid');
const collectionPayment = document.getElementById('collectionPayment');
const addCollectionPayment = document.getElementById('addCollectionPayment');
const updateCollectionRecord = document.getElementById('updateCollectionRecord');


const collectionMonth = document.getElementById('collectionMonth');
const collectionQuota = document.getElementById('collectionQuota');
const collectionTotalBalance = document.getElementById('collectionTotalBalance');
const collectionRunning = document.getElementById('collectionRunning');
const saveCollectionQuota = document.getElementById('saveCollectionQuota');
const collectionPercent = document.getElementById('collectionPercent');
const collectionHistoryBtn = document.getElementById('collectionHistoryBtn');

const collectionNamesList = document.getElementById('collectionNamesList');
const collectionTabs = document.querySelectorAll('.collection-tab');

let collectionData = JSON.parse(localStorage.getItem('collectionData') || '[]');
let currentCollectionTab = '3NM';
let quotaData = JSON.parse(localStorage.getItem('collectionQuotaData') || '{}');
let monthlyAccountCounts =
  JSON.parse(localStorage.getItem('monthlyAccountCounts') || '{}');

function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function registerAccountCount(name, date) {
  const monthKey = getMonthKey(date);

  if (!monthlyAccountCounts[monthKey]) {
    monthlyAccountCounts[monthKey] = {
      Total: 0,
      entries: {} 
    };
  }

  if (!monthlyAccountCounts[monthKey].entries[date]) {
    monthlyAccountCounts[monthKey].entries[date] = [];
  }

  const dayEntries = monthlyAccountCounts[monthKey].entries[date];

  if (dayEntries.includes(name)) return;
  dayEntries.push(name);
  monthlyAccountCounts[monthKey].Total++;

  localStorage.setItem(
    'monthlyAccountCounts',
    JSON.stringify(monthlyAccountCounts)
  );
}


const COLLECTION_TAB_TITLES = {
  '3NM': '3 Months Non-moving Accs',
  '6NM': '6 Months Non-moving Accs',
  '9NM': '9 Months Non-moving Accs',
  '12NM': '12 Months Non-moving Accs',
  'Moving': 'Moving Accounts',
  'Total': 'All Accounts'
};
let collectionNamesVisible = false;

collectionBtn.onclick = () => collectionModal.classList.remove('hidden');
closeCollectionModal.onclick = () => collectionModal.classList.add('hidden');

const infoBlock = document.getElementById('collectionInfoBlock');
expandPanelBtn.onclick = () => {
  const expanded = panelContent.classList.toggle('visible');

  infoBlock.classList.toggle('hidden', expanded);

  expandPanelBtn.textContent = expanded ? '>' : '<';
};


saveCollectionQuota.onclick = () => {
  const month = collectionMonth.value;
  const quota = Number(collectionQuota.value || 0);

  quotaData[month] = {
    quota,
    balance: quota - (quotaData[month]?.running || 0),
    running: quotaData[month]?.running || 0
  };

  localStorage.setItem(
    'collectionQuotaData',
    JSON.stringify(quotaData)
  );

  collectionTotalBalance.value = quotaData[month].balance;
  collectionRunning.value = quotaData[month].running;

  updateCollectionPercentage(month);
};

updateCollectionRecord.onclick = () => {
  const name = collectionName.value.trim();
  const balance = Number(collectionBalance.value || 0);
  const date = collectionDate.value;

  if (!name || !date || isNaN(balance)) return;

  let record = collectionData.find(r => r.name === name);

  if (!record) {
    record = {
      name,
      lastPaid: date,
      balance: balance,
      payments: [] 
    };
    collectionData.push(record);
  } else {

    record.lastPaid = date;
    record.balance = balance;
  }

  localStorage.setItem('collectionData', JSON.stringify(collectionData));

  collectionNamesVisible = false;
  updateTabCounts();
  collectionNamesList.innerHTML = '';

  collectionName.value = '';
  collectionBalance.value = '';
  collectionLastPaid.value = '';
  const today = new Date().toISOString().split('T')[0];
  collectionDate.value = today;

  collectionName.focus();

  showNotification('Record updated successfully ✅');
};

addCollectionPayment.onclick = () => {
  const name = collectionName.value.trim();
  const balance = Number(collectionBalance.value || 0);
  const date = collectionDate.value;
  const payment = Number(collectionPayment.value || 0);

  if (!name || !date || isNaN(payment) || payment < 0) return;

  let record = collectionData.find(r => r.name === name);

if (!record) {
  record = {
    name,
    lastPaid: date,
    balance: balance,          
    payments: []
  };
  collectionData.push(record);
}

  record.lastPaid = date;
  record.payments.push({ amount: payment, date });
  record.balance -= payment;
  registerAccountCount(name, date);

if (record.balance < 0) record.balance = 0;

  const month = collectionMonth.value;
  if (quotaData[month]) {
    quotaData[month].balance -= payment;
    quotaData[month].running += payment;
  }

  localStorage.setItem('collectionData', JSON.stringify(collectionData));
  localStorage.setItem('collectionQuotaData', JSON.stringify(quotaData));
  collectionTotalBalance.value = quotaData[month]?.balance || 0;
  collectionRunning.value = quotaData[month]?.running || 0;
  const monthKey = month;
const monthData = monthlyAccountCounts[monthKey];

const totalAccInput = document.getElementById('collectionTotalAcc');
if (monthData) {
  totalAccInput.value = monthData.Total;
} else {
  totalAccInput.value = 0;
}

  updateCollectionPercentage(month);

    collectionNamesVisible = false;
  updateTabCounts();
  collectionNamesList.innerHTML = '';

collectionName.value = '';
collectionBalance.value = '';
collectionPayment.value = '';
collectionLastPaid.value = '';
const today = new Date().toISOString().split('T')[0];
collectionDate.value = today;
collectionName.focus();

};

function renderCollectionNames(filter = '') {
  updateTabCounts();
  if (!collectionNamesVisible) {
    collectionNamesList.innerHTML = '';
    return;
  }

  collectionNamesList.innerHTML = '';

  const filtered = collectionData
    .filter(r => {
      const matchSearch =
        r.name.toLowerCase().includes(filter.toLowerCase());

      if (!matchSearch) return false;

      if (currentCollectionTab === 'Total') return true;

      return getMonthBucket(r) === currentCollectionTab;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!filtered.length) {
    collectionNamesList.innerHTML =
      '<p class="empty-state">No records in this category</p>';
    return;
  }

  filtered.forEach(record => {
  const div = document.createElement('div');
  div.className = 'promise';
  div.style.display = 'flex';
  div.style.justifyContent = 'space-between';
  div.style.alignItems = 'center';
  div.style.padding = '5px 10px';


  const infoDiv = document.createElement('div');
  infoDiv.textContent = `${record.name} | Bal: ${record.balance} | Last: ${record.lastPaid}`;
  infoDiv.style.flex = '1';
  infoDiv.style.cursor = 'pointer';
  infoDiv.onclick = () => {
    collectionName.value = record.name;
    collectionLastPaid.value = record.lastPaid || '';
    collectionBalance.value = record.balance ?? 0;
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '❌';
  deleteBtn.style.width = '32px';
  deleteBtn.style.height = '32px';
  deleteBtn.style.minWidth = '32px';
  deleteBtn.style.minHeight = '32px';
  deleteBtn.style.maxWidth = '32px';
  deleteBtn.style.maxHeight = '32px';
  deleteBtn.style.padding = '0';
  deleteBtn.style.marginLeft = '10px';
  deleteBtn.style.fontSize = '18px';
  deleteBtn.style.display = 'flex';
  deleteBtn.style.justifyContent = 'center';
  deleteBtn.style.alignItems = 'center';
  deleteBtn.style.cursor = 'pointer';

  deleteBtn.onclick = e => {
    e.stopPropagation(); 
    showConfirm(`Are you sure you want to delete "${record.name}"?`, () => {
      collectionData = collectionData.filter(r => r.name !== record.name);
      localStorage.setItem('collectionData', JSON.stringify(collectionData));
      renderCollectionNames(collectionSearch.value); 
    });
  };

  div.appendChild(infoDiv);
  div.appendChild(deleteBtn);
  collectionNamesList.appendChild(div);
});

}

function buildCollectionCopyText() {
  if (!currentCollectionTab) return null;

  const title = COLLECTION_TAB_TITLES[currentCollectionTab];
  if (!title) return null;

  const records = collectionData
    .filter(r => {
      if (currentCollectionTab === 'Total') return true;
      return getMonthBucket(r) === currentCollectionTab;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!records.length) return null;

  let text = `These are your ${title}:\n\n`;

  records.forEach((r, i) => {
    text +=
`${i + 1}. ${r.name}
   Bal: ${r.balance}
   Last: ${r.lastPaid}

`;
  });

  return text.trim();
}

copyCollectionBtn.onclick = async () => {
  const text = buildCollectionCopyText();

  if (!text) {
    showNotification(
      'Please select the tab you want to copy:\n\n' +
      '3NM, 6NM, 9NM, 12NM\n\n' +
      'Tap or select the tab, then click Copy.'
    );
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard successfully ✅');
  } catch {
    showNotification('Failed to copy. Please try again.');
  }
};



function updateCollectionPercentage(month) {
  const data = quotaData[month];

  if (!data || !data.quota || data.quota <= 0) {
    collectionPercent.textContent = '0%';
    return;
  }

  const percent = Math.min(
    100,
    Math.round((data.running / data.quota) * 100)
  );

  collectionPercent.textContent = percent + '%';
}

function restoreCollectionUI() {
  const today = new Date().toISOString().split('T')[0];
  collectionDate.value = today;

  const month = collectionMonth.value;

  if (quotaData[month]) {
    collectionQuota.value = quotaData[month].quota ?? 0;
    collectionTotalBalance.value = quotaData[month].balance ?? 0;
    collectionRunning.value = quotaData[month].running ?? 0;
  } else {
    collectionQuota.value = '';
    collectionTotalBalance.value = '';
    collectionRunning.value = '';
  }
  
  const monthData = monthlyAccountCounts[month];
  const totalAccInput = document.getElementById('collectionTotalAcc');
  if (monthData) {
    totalAccInput.value = monthData.Total ?? 0;
  } else {
    totalAccInput.value = 0;
  }
  
  updateCollectionPercentage(month);

}

collectionMonth.onchange = restoreCollectionUI;

collectionSearch.oninput = () => renderCollectionNames(collectionSearch.value);

collectionTabs.forEach(tab => {
  tab.onclick = () => {
    collectionTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    currentCollectionTab = tab.dataset.tab;

    collectionNamesVisible = true;
    renderCollectionNames();
  };
});

function updateTabCounts() {
  const counts = { '3NM':0,'6NM':0,'9NM':0,'12NM':0,'Moving':0,'Total':0 };
  const now = new Date();

  collectionData.forEach(r => {
    const last = new Date(r.lastPaid);
    const months =
      (now.getFullYear() - last.getFullYear()) * 12 +
      (now.getMonth() - last.getMonth());

    if (months >= 12) counts['12NM']++;
    else if (months >= 9) counts['9NM']++;
    else if (months >= 6) counts['6NM']++;
    else if (months >= 3) counts['3NM']++;
    else counts['Moving']++;
  });
  counts['Total'] = collectionData.length;

  const total = counts['Total'] || 1;
  function percent(val) {
    return Math.round((val / total) * 100);
  }

  setCountWithPercent('count3NM', counts['3NM'], percent(counts['3NM']));
  setCountWithPercent('count6NM', counts['6NM'], percent(counts['6NM']));
  setCountWithPercent('count9NM', counts['9NM'], percent(counts['9NM']));
  setCountWithPercent('count12NM', counts['12NM'], percent(counts['12NM']));
  setCountWithPercent('countMoving', counts['Moving'], percent(counts['Moving']));
  setCountWithPercent('countTotal', counts['Total'], 100);
}
function setCountWithPercent(elId, count, pct) {
  const el = document.getElementById(elId);
  if (!el) return;

  el.innerHTML = `
    <div class="tab-metric">
      <div class="tab-percent">${pct}%</div>
      <div class="tab-count">${count}</div>
    </div>
  `;
}

function getMonthBucket(record) {
  if (!record.lastPaid) return 'Moving';

  const now = new Date();
  const last = new Date(record.lastPaid);

  const months =
    (now.getFullYear() - last.getFullYear()) * 12 +
    (now.getMonth() - last.getMonth());

  if (months >= 12) return '12NM';
  if (months >= 9)  return '9NM';
  if (months >= 6)  return '6NM';
  if (months >= 3)  return '3NM';
  return 'Moving';
}

collectionNamesVisible = false;
renderCollectionNames();
restoreCollectionUI();


});
document.addEventListener('DOMContentLoaded', () => {
  const expandBtn = document.getElementById('expandPanelBtn');
  const panel = document.getElementById('panelContent');

  expandBtn.addEventListener('click', () => {
    panel.classList.toggle('hidden');
    expandBtn.textContent = panel.classList.contains('hidden') ? '>' : '<';
  });
});

