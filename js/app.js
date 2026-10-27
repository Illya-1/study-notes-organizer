import { NotesDB } from './db/NotesDB.js';
import { NotesSectionComponent } from './components/NotesSectionComponent.js';

const notesDB = new NotesDB();
const notesSection = new NotesSectionComponent(notesDB);

const form = document.querySelector("#note-form");
const titlecInput = document.querySelector('#form-topic-input');
const API_URL = "https://jsonplaceholder.typicode.com/posts?userId=2";

async function main() {
    try {
        await migrateData();
        await initNotes();
        await notesSection.init();
    } catch (error) {
        notesSection.showError("На жаль, сталася помилка під час завантаження контенту!");
        console.log(error)
    }
}

await main();

async function initNotes() {
    const dbNotes = await notesDB.getAllItems();
    if (dbNotes.length === 0) {
        await loadDataFromNetwork();
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newNote = {
        subject: form.elements.subject.value,
        title: form.elements.title.value.trim(),
        text: form.elements.text.value.trim(),
        pages: Number(form.elements.pages.value),
        learned: form.elements.learned.checked,
        date: new Date().toISOString().split("T")[0],
        id: Date.now(),
    };

    await notesDB.addItem(newNote);
    await notesSection.refresh();

    form.reset();
});

// Слушатель валидации заголовка
titlecInput.addEventListener("input", () => {
    if (titlecInput.validity.patternMismatch) {
        titlecInput.setCustomValidity('Тема має містити щонайменше 3 символи');
    } else {
        titlecInput.setCustomValidity('');
    }
});

// Загрузка по сети (переключает состояния через notesSection)
async function loadDataFromNetwork() {
    try {
        notesSection.showLoading();
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Помилка сервера: ${response.status}`);
        }

        const data = await response.json();
        for (const item of data) {
            await notesDB.addItem({
                id: item.id,
                title: item.title,
                subject: item.id % 2 === 0 ? "Математичний аналіз" : "Веб-програмування",
                text: item.body,
                pages: 1,
                learned: false,
                date: new Date().toISOString().split("T")[0]
            });
        }
    } catch (error) {
        console.error(error);
        notesSection.showError("Сталася помилка під час завантаження даних!");
    }
}

function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem('notes');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

async function migrateData() {
    const oldNotes = loadFromLocalStorage();
    if (oldNotes.length > 0) {
        for (const note of oldNotes) {
            await notesDB.addItem(note);
        }
        localStorage.removeItem('notes');
    }
}