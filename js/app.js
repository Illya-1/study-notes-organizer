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
        console.error(error);
    }
}

await main();

async function initNotes() {
    const dbNotes = await notesDB.getAllItems();
    if (dbNotes.length === 0) {
        await loadDataFromNetwork();
    }
}

let editingNoteId = null;
const submitBtn = form.querySelector('button[type="submit"]');

// Передача конспекту у форму для редагування
notesSection.listView.onEditNote = (note) => {
    editingNoteId = note.id;
    form.elements.subject.value = note.subject;
    form.elements.title.value = note.title;
    form.elements.pages.value = note.pages;
    form.elements.text.value = note.text;
    form.elements.learned.checked = Boolean(note.isLearned);

    submitBtn.textContent = "Зберегти зміни";
    form.scrollIntoView({ behavior: 'smooth' });
};

// Збереження нового або оновленого конспекту
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const noteData = {
        subject: form.elements.subject.value,
        title: form.elements.title.value.trim(),
        text: form.elements.text.value.trim(),
        pages: Number(form.elements.pages.value),
        isLearned: form.elements.learned.checked, // Тільки isLearned
        date: new Date().toISOString().split("T")[0],
        id: editingNoteId === null ? Date.now() : editingNoteId,
    };

    await notesDB.addItem(noteData);
    await notesSection.refresh();

    form.reset();
    editingNoteId = null;
    submitBtn.textContent = "Додати конспект";
});

titlecInput.addEventListener("input", () => {
    if (titlecInput.validity.patternMismatch) {
        titlecInput.setCustomValidity('Тема має містити щонайменше 3 символи');
    } else {
        titlecInput.setCustomValidity('');
    }
});

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
                isLearned: false,
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
            const isLearnedValue = Boolean(note.isLearned || note.learned);
            delete note.learned;
            note.isLearned = isLearnedValue;

            await notesDB.addItem(note);
        }
        localStorage.removeItem('notes');
    }
}