const app = document.getElementById('app');
let selectedCharacter = null;
let currentLocationIndex = 0;
document.body.style.backgroundColor = '#808080';
async function loadData() {
  const [charsRes, locsRes] = await Promise.all([
    fetch('characters.json'),
    fetch('locations.json')
  ]);
  return {
    characters: await charsRes.json(),
    locations: await locsRes.json()
  };
}
function fadeTransition(callback) {
  app.style.opacity = 0;
  setTimeout(() => {
    callback();
    setTimeout(() => (app.style.opacity = 1), 50);
  }, 300);
}
function renderMainMenu() {
  app.innerHTML = `
    <div class="container" style="text-align:center;">
      <h1>Записки сумасшедшего</h1>
      <button class="button" onclick="renderCharacterSelection()">Начать прохождение</button>
    </div>
  `;
}
function showFullCharacterInfo(char) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${char.name}</h2>
      <img src="images/${char.image}" class="character-image"/>
      <p><strong>Класс:</strong> ${char.class}</p>
      <p><strong>Описание:</strong> ${char.description}</p>
      <h4>Характеристики:</h4>
      <ul>
        ${Object.entries(char.stats).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
      </ul>
      <h4>Инвентарь:</h4>
      <ul>${char.inventory.map(i => `<li>${i}</li>`).join('')}</ul>
      <button class="button small-button" onclick="this.closest('.modal').remove()">Закрыть</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.style.display = 'flex';
}
function renderCharacterSelection() {
  const html = `
    <div class="container">
      <h2>Выберите персонажа</h2>
      ${data.characters.characters
        .filter(char => !['korgreyv', 'porje', 'andrey'].includes(char.id.toString()))
        .map(char => `
        <div class="card">
          <img src="images/${char.image}" class="character-image" loading="lazy" onclick="showFullCharacterInfo(${JSON.stringify(char)})"/>
          <h3>${char.name}</h3>
          <p><strong>Класс:</strong> ${char.class}</p>
          <button class="button" onclick="selectCharacter('${char.id}')">Выбрать</button>
        </div>
      `).join('')}
    </div>
  `;
  app.innerHTML = html;
}
function selectCharacter(id) {
  const character = data.characters.characters.find(c => c.id.toString() === id.toString());
  if (!character) return;
  selectedCharacter = JSON.parse(JSON.stringify(character));
  localStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter));
  localStorage.setItem('currentLocationIndex', 0);
  currentLocationIndex = 0;
  renderLocation(currentLocationIndex);
}
function renderLocation(index) {
  const loc = data.locations.locations[index];
  if (!loc) return;
  currentLocationIndex = index;
  localStorage.setItem('currentLocationIndex', index);
  const showNewButton = loc.title.toLowerCase().includes("коллегия магов")
    ? `<button class="button small-button" onclick="showNewCharacters()">Показать персонажей</button>`
    : '';
  fadeTransition(() => {
    app.innerHTML = `
      <div class="container">
        <h1>${loc.title}</h1>
        <p>${loc.description}</p>
        <img src="images/${loc.image}" class="location-image" loading="lazy"/>
        <div class="card stats-card">
          <h3>Характеристики</h3>
          <div class="stats-grid">
            ${Object.entries(selectedCharacter.stats).map(([k, v]) => `
              <div class="stat-box">
                <label>${k}</label>
                <input type="number" value="${v}" onchange="updateStat('${k}', this.value)" />
              </div>
            `).join('')}
          </div>
        </div>
        <div class="action-buttons">
          <button class="button small-button" onclick="showFullCharacterInfo(selectedCharacter)">Карточка</button>
          <button class="button small-button" onclick="rollDice()">Кости</button>
          <button class="button small-button" onclick="openInventory()">Инвентарь</button>
          <button class="button small-button" onclick="openNotes()">Заметки</button>
          ${showNewButton}
        </div>
        <div class="navigation-buttons">
          ${index > 0 ? `<button class="button small-button" onclick="renderLocation(${index - 1})">Предыдущая локация</button>` : ''}
          ${index < data.locations.locations.length - 1 ? `<button class="button small-button" onclick="renderLocation(${index + 1})">Следующая локация</button>` : ''}
        </div>
        <div style="text-align:center; margin-top: 0.5rem;">
          <button class="button small-button" onclick="renderMainMenu()">Главное меню</button>
        </div>
      </div>
    `;
  });
}
function updateStat(stat, value) {
  selectedCharacter.stats[stat] = parseInt(value);
  localStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter));
}
function showNewCharacters() {
  const newChars = ['korgreyv', 'porje'].map(id => data.characters.characters.find(c => c.id === id)).filter(Boolean);
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Выберите нового персонажа</h3>
      ${newChars.map(char => `
        <div class="card">
          <img src="images/${char.image}" class="character-image" loading="lazy"/>
          <h3>${char.name}</h3>
          <p><strong>Класс:</strong> ${char.class}</p>
          <p>${char.description.substring(0, 100)}...</p>
          <button class="button small-button" onclick="replaceCharacter('${char.id}')">Выбрать</button>
        </div>
      `).join('')}
      <button class="button small-button" onclick="this.closest('.modal').remove()">Закрыть</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.style.display = 'flex';
}
function replaceCharacter(newId) {
  const newChar = data.characters.characters.find(c => c.id === newId);
  if (!newChar) return;
  selectedCharacter = JSON.parse(JSON.stringify(newChar));
  localStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter));
  document.querySelector('.modal')?.remove();
  renderLocation(currentLocationIndex);
}
function rollDice() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  const dice = ['D4', 'D6', 'D8', 'D10', 'D12', 'D20'];
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Выберите кости</h3>
      <div>${dice.map(d => `<label><input type="checkbox" value="${d}"> ${d}</label>`).join('<br/>')}</div>
      <button class="button small-button" id="roll">Бросить</button>
      <div id="dice-result" style="margin-top:1rem;"></div>
      <button class="button small-button" style="margin-top:1rem;" id="close-dice">Закрыть</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#roll').onclick = () => {
    const selected = [...modal.querySelectorAll('input[type=checkbox]:checked')];
    const result = selected.map(input => {
      const sides = parseInt(input.value.slice(1));
      return `${input.value}: ${Math.floor(Math.random() * sides) + 1}`;
    });
    modal.querySelector('#dice-result').innerHTML = `<strong>Результаты:</strong><br>${result.join('<br>')}`;
  };
  modal.querySelector('#close-dice').onclick = () => modal.remove();
}
function openInventory() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  let items = [...selectedCharacter.inventory];
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Инвентарь</h3>
      <div id="inventory-items"></div>
      <input type="text" id="new-item" placeholder="Новый предмет"/>
      <button class="button small-button" id="add-item">Добавить</button>
      <button class="button small-button" id="close-inventory" style="margin-top:1rem;">Закрыть</button>
    </div>
  `;
  document.body.appendChild(modal);
  const list = modal.querySelector('#inventory-items');
  function renderItems() {
    list.innerHTML = '';
    items.forEach((item, index) => {
      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.gap = '0.5rem';
      div.style.marginBottom = '0.5rem';
      div.innerHTML = `
        <input type="text" value="${item}" />
        <button class="button small-button">Удалить</button>
      `;
      div.querySelector('input').oninput = e => items[index] = e.target.value;
      div.querySelector('button').onclick = () => {
        items.splice(index, 1);
        renderItems();
      };
      list.appendChild(div);
    });
  }
  modal.querySelector('#add-item').onclick = () => {
    const val = modal.querySelector('#new-item').value.trim();
    if (val) {
      items.push(val);
      modal.querySelector('#new-item').value = '';
      renderItems();
    }
  };
  modal.querySelector('#close-inventory').onclick = () => {
    selectedCharacter.inventory = items;
    localStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter));
    modal.remove();
  };
  renderItems();
}
function openNotes() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  let notes = [...(selectedCharacter.notes || [])];
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Заметки</h3>
      <input type="text" id="new-note" placeholder="Новая заметка"/>
      <button class="button small-button" id="add-note">Добавить</button>
      <div id="notes-list" style="margin-top:1rem;"></div>
      <button class="button small-button" id="close-notes" style="margin-top:1rem;">Закрыть</button>
    </div>
  `;
  document.body.appendChild(modal);
  const list = modal.querySelector('#notes-list');
  function renderNotes() {
    list.innerHTML = '';
    notes.forEach((note, index) => {
      const div = document.createElement('div');
      div.innerHTML = `
        <textarea rows="2">${note}</textarea>
        <button class="button small-button">Удалить</button>
      `;
      div.querySelector('textarea').oninput = e => notes[index] = e.target.value;
      div.querySelector('button').onclick = () => {
        notes.splice(index, 1);
        renderNotes();
      };
      list.appendChild(div);
    });
  }
  modal.querySelector('#add-note').onclick = () => {
    const val = modal.querySelector('#new-note').value.trim();
    if (val) {
      notes.push(val);
      modal.querySelector('#new-note').value = '';
      renderNotes();
    }
  };
  modal.querySelector('#close-notes').onclick = () => {
    selectedCharacter.notes = notes;
    localStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter));
    modal.remove();
  };
  renderNotes();
}
// Инициализация
let data;
loadData().then(d => {
  data = d;
  const savedChar = localStorage.getItem('selectedCharacter');
  const savedIndex = localStorage.getItem('currentLocationIndex');
  if (savedChar && savedIndex !== null) {
    selectedCharacter = JSON.parse(savedChar);
    currentLocationIndex = parseInt(savedIndex);
    renderLocation(currentLocationIndex);
  } else {
    renderMainMenu();
  }
});
