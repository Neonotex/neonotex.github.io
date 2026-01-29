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
const saveBtn = document.getElementById('savePromise');
const closeModal = document.getElementById('closeModal');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const homeBtn = document.getElementById('homeBtn');

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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

});
