const notes = [];
const notesDisplayWindow = document.querySelector("#notes-list");
const loadDisplayWindow = document.querySelector("#loading-indicator");
const errorDisplayWindow = document.querySelector("#error-message");
const errorDisplayMessage = errorDisplayWindow.querySelector("p");

const notesCounter = document.querySelector("#notes-count");
const refreshBtn = document.querySelector("#refresh-btn");

const API_URL = "https://jsonplaceholder.typicode.com/posts?userId=2";

const DB_NAME = 'NotesDB';
const DB_VERSION = 1;
const STORE_NAME = 'notes';

//main метод, збирає в одному блоці весь код який має запускатись при завантаженні сторінки і який не є event handler-ом
async function main(){
    try {
        await migrateData();
        await initNotes();
        renderCards(notes, notesDisplayWindow);
    } catch (error) {
        notesDisplayWindow.hidden = true;
        errorDisplayWindow.hidden = false;
        errorDisplayMessage.textContent = "На жаль, сталася помилка під час завантаження контенту!";
        loadDisplayWindow.hidden = true;
    }
}

main()

// Координує первинне наповнення: читає IndexedDB або виконує мережевий запит, якщо база порожня
async function initNotes() {
    const dbNotes = await getAllItems();

    if (dbNotes.length > 0) {
        notes.length = 0;
        notes.push(...dbNotes);
        notesDisplayWindow.hidden = false;
        errorDisplayWindow.hidden = true;
        loadDisplayWindow.hidden = true;
        return;
    }

    await loadDataFromNetwork();
}

// === RENDERING ===

// Створює DOM-вузол картки конспекту із заголовком, зображенням, назвою предмета та умовним класом exam-soon
function buildHtmlCard(note) {
    const card = document.createElement("article");

    const title = note.title;
    const subject = note.subject;
    const text = note.text || "NOTEXT";
    const date = note.date || new Date().toISOString().split("T")[0];
    const isExamSoon = note.examSoon;
    
    card.className = `card ${isExamSoon ? "exam-soon" : ""}`;
    card.dataset.subject = subject;
    card.dataset.id = note.id;

    card.innerHTML = `
        <header>
            <div class="card-header-top">
                <h3>${title}</h3>
                <button type="button" class="btn-delete" title="Видалити конспект" aria-label="Видалити конспект">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12z"/>
                    </svg>
                </button>
            </div>
            <span class="badge-subject">${subject}</span>
        </header>

        <p class="card-text">${text}</p>

        <footer>
            <time datetime="${date}">${date}</time>
            <label>
                <input type="checkbox" name="examSoon" ${isExamSoon ? "checked" : ""}>
                Скоро іспит
            </label>
        </footer>
    `;

    return card;
}
// Очищує контейнер і рендерить переданий масив конспектів у DOM, оновлюючи лічильник
function renderCards(items, container) {
    if (!container) return;

    container.innerHTML = "";

    for (const note of items) {
        container.append(buildHtmlCard(note));
    }

    updateNotesCounter(items);
}

// Обраховує загальну кількість конспектів та сторінок і виводить значення в елемент #notes-count
function updateNotesCounter(items) {
    const totalPages = items.reduce((sum, item) => sum + item.pages, 0);
    notesCounter.textContent = `Всього: ${items.length} (сторінок: ${totalPages})`;
}

// === RENDERING ===



//=== EVENT HANDLERS ===
const form = document.querySelector("#note-form");
const titlecInput = document.querySelector('#form-topic-input');
const subjectFilter = document.querySelector("#subject-filter");

// Обробник надсилання форми: валідує вхідні дані, створює новий конспект,
// оновлює інтерфейс списку та скидає поля форми
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const subjectValue = form.elements.subject.value;
    const titleValue = form.elements.title.value.trim();
    const pagesValue = Number(form.elements.pages.value);
    const textValue = form.elements.text.value.trim();
    const isExamSoon = form.elements.examSoon.checked;

    const newNote = {
        subject: subjectValue,
        title: titleValue,
        text: textValue,
        pages: pagesValue,
        examSoon: isExamSoon,
        date: new Date().toISOString().split("T")[0],
        id: Date.now(),
    };

    await addItem(newNote);
    const updatedNotes = await getAllItems();
    notes.length = 0;
    notes.push(...updatedNotes);

    subjectFilter.value = "all";
    renderCards(notes, notesDisplayWindow);

    form.reset();
});

// Додаткова валідація поля title: підміна стандартного системного повідомлення браузера на зрозумілу українську підказку при невідповідності патерну
titlecInput.addEventListener("input", (event) =>{
    if(titlecInput.validity.patternMismatch){
        titlecInput.setCustomValidity('Тема має містити щонайменше 3 символи');
    }
    else{
        titlecInput.setCustomValidity('');
    }
})

// Делегування події change на контейнері карток: синхронізує стан
// властивості examSoon у масиві notes та оновлює стилі підсвітки картки
notesDisplayWindow.addEventListener('change', async (event) => {
    if (event.target.name !== 'examSoon') {
        return;
    }

    const cardElement = event.target.closest('[data-id]');
    if (!cardElement) {
        return;
    }

    const noteId = Number(cardElement.dataset.id);

    const targetNote = notes.find((note) => note.id === noteId);
    if (!targetNote) {
        return;
    }

    targetNote.examSoon = event.target.checked;
    
    await addItem(targetNote);
    cardElement.classList.toggle('exam-soon', event.target.checked);
});


//Listner для оновлення списку карток після натискання на кнопку перезавантаження
refreshBtn.addEventListener("click", async () => {
    notes.length = 0;
    notesCounter.textContent = "Всього: — (сторінок: —)";

    const dbNotes = await getAllItems();
    notes.push(...dbNotes);
    renderCards(notes, notesDisplayWindow);
});

notesDisplayWindow.addEventListener("click", async (event) => {
    const deleteBtn = event.target.closest(".btn-delete");
    if (!deleteBtn) return;

    const cardElement = deleteBtn.closest("[data-id]");
    if (!cardElement) return;

    const noteId = Number(cardElement.dataset.id);

    await deleteItem(noteId);

    const index = notes.findIndex(n => n.id === noteId);
    if (index !== -1) {
        notes.splice(index, 1);
    }

    renderCards(notes, notesDisplayWindow);
});

subjectFilter.addEventListener("change", async (event) => {
    const selectedSubject = event.target.value;

    const allNotes = await getAllItems();

    const filteredNotes = selectedSubject === "all"
        ? allNotes
        : allNotes.filter((note) => note.subject === selectedSubject);

    renderCards(filteredNotes, notesDisplayWindow);
});

//=== EVENT HANDLERS ===



//=== NETWORK ===

//Функція для завантаження даних з API_URL за допомогою fetch api. Отримані дані адаптуються до формату даних з яким працює логіка сторінки 
async function loadDataFromNetwork() {
    try{
        notesDisplayWindow.hidden = true;
        errorDisplayWindow.hidden = true;
        loadDisplayWindow.hidden = false;
        const response = await fetch(API_URL);
        if(!response.ok){
            throw new Error(`Помилка сервера: ${response.status}`);
        }

        const data = await response.json();

        for(const item of data){
            await addItem({
                id: item.id,
                title: item.title,
                subject: item.id % 2 === 0 ? "Математичний аналіз" : "Веб-програмування",
                text: item.body,
                pages: 1,
                examSoon: false,
                date: new Date().toISOString().split("T")[0]
            });
        }
        const dbNotes = await getAllItems();
        notes.length = 0;
        notes.push(...dbNotes);

        notesDisplayWindow.hidden = false;
    }
    catch(error){
        console.error(error);
        errorDisplayWindow.hidden = false;
        errorDisplayMessage.textContent = "Сталася помилка під час завантаження даних!";
    }
    finally{
        loadDisplayWindow.hidden = true;
    }
}

//=== NETWORK ===

//=== LOCAL STORAGE ===

function saveToLocalStorage(items){
    localStorage.setItem('notes', JSON.stringify(items));
}

function loadFromLocalStorage(){
    try{
        const raw = localStorage.getItem('notes');
        return raw ? JSON.parse(raw) : [];
    }catch(error){
        console.log('Пошкоджені дані в localStorage');
        return [];
    }
}

//=== LOCAL STORAGE ===

//=== IndexedDb ===

// Відкриває зв'язок з IndexedDB або ініціалізує сховище з ключем id при першому запуску
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('notes')) {
                db.createObjectStore('notes', { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Забезпечує безпечне отримання інстансу БД з перехопленням системних помилок доступу
async function getDatabase() {
    try {
        return await openDB();
    } catch (error) {
        console.error("Помилка відкриття IndexedDB:", error);
        notesDisplayWindow.hidden = true;
        errorDisplayMessage.textContent = "Не вдалося відкрити базу даних конспектів!";
        errorDisplayWindow.hidden = false;
        loadDisplayWindow.hidden = true;
        throw error;
    }
}

// Одноразово імпортує наявні конспекти з localStorage до IndexedDB та очищає старе сховище
async function migrateData() {
    const oldNotes = loadFromLocalStorage();
    if (oldNotes.length > 0) {
        for (const note of oldNotes) {
            await addItem(note);
        }
        localStorage.removeItem('notes');
    }
}

// Записує новий або оновлює наявний конспект у сховищі (транзакція readwrite)
async function addItem(item) {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(item);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Повертає повний список конспектів зі сховища (транзакція readonly)
async function getAllItems() {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Видаляє запис конспекту за унікальним id
async function deleteItem(id) {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

//=== IndexDb ===