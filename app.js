document.addEventListener('DOMContentLoaded', () => {

const todayContainer = document.getElementById('todayContainer');
const modal = document.getElementById('promiseModal');
const addBtn = document.getElementById('addBtn');
const saveBtn = document.getElementById('savePromise');
const closeModal = document.getElementById('closeModal');
const searchInput = document.getElementById('searchInput');
const clientName = document.getElementById('clientName');
const promiseDate = document.getElementById('promiseDate');
const description = document.getElementById('description');


let editIndex = null;
let promises = JSON.parse(localStorage.getItem('neonote_promises') || '[]');
let isMoving = false;


function today() {
  return new Date().toISOString().split('T')[0];
}

function render(list = promises, mode = 'today') {
  todayContainer.innerHTML = '';

  let items = list;

  if (mode === 'today') {
    items = list.filter(p => p.date === today() && !p.done);
  }

  if (!items.length) {
    todayContainer.innerHTML =
      mode === 'today'
        ? '<p>Wala kay promise karon Dong! Pag trabaho intawon</p>'
        : '<p>Wala pana promise Dong! Trabahoa sa!</p>';
    return;
  }

  items.forEach((p, i) => {
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
          !p.done
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

  if (!q) {
    render(promises, 'today');
    return;
  }

  const res = promises.filter(p =>
    p.name.toLowerCase().includes(q)
  );

  render(res, 'search');
};

render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

});
