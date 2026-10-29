import { NotesDB } from "./db/NotesDB.js";
import { Router } from "./Router.js";
import { NotesScreen } from "./screens/NotesScreen.js";
import { NoteDetailsScreen } from "./screens/NoteDetailsScreen.js";
import {ServerDB} from "./db/ServerDB.js";

const API_URL = "https://jsonplaceholder.typicode.com/posts?userId=2";

const notesDB = new NotesDB();
const serverDB = new ServerDB();
const db = serverDB;

const routes = [
    { path: "/", screen: NotesScreen },
    { path: "/subject/:subject", screen: NotesScreen },
    { path: "/notes/:id", screen: NoteDetailsScreen }
];

try {
    await migrateData();
    await initNotes();

    const appContainer = document.querySelector("#app");
    const router = new Router(routes, appContainer, db);

    await router.handleRoute();
} catch (error) {
    console.error("Помилка ініціалізації додатку:", error);
}

async function initNotes() {
    const dbNotes = await db.getAllItems();
    if (dbNotes.length > 0) return;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Помилка сервера: ${response.status}`);
        }

        const data = await response.json();
        for (const item of data) {
            await db.addItem({
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
        console.error("Не вдалося завантажити початкові дані з мережі:", error);
    }
}

async function migrateData() {
    try {
        const raw = localStorage.getItem("notes");
        const oldNotes = raw ? JSON.parse(raw) : [];

        if (oldNotes.length > 0) {
            for (const note of oldNotes) {
                await db.addItem(note);
            }
            localStorage.removeItem("notes");
        }
    } catch (error) {
        console.error("Помилка під час міграції даних з LocalStorage:", error);
    }
}