const express = require('express');
const path = require('node:path');
let notes = require('./notes.json');

const app = express();
const PORT = 3000;
const rootDir = path.join(__dirname, '..');

app.use(express.json());

app.use('/css', express.static(path.join(rootDir, 'css')));
app.use('/js', express.static(path.join(rootDir, 'js')));

const fs = require('node:fs/promises');
const notesFilePath = path.join(__dirname, 'notes.json');
async function saveNotesToFile() {
    await fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2), 'utf-8');
}

app.get('/api/notes', (req, res) => {
    const { subject } = req.query;
    
    if (subject){
        const filteredNotes = notes.filter(item => item.subject.toLowerCase() === subject.toLowerCase());
        return res.json(filteredNotes);
    }
    
    res.json(notes);
});

app.get('/api/notes/:id', (req, res) => {
    const noteId = Number(req.params.id);
    if (Number.isNaN(noteId)) {
        return res.status(400).json({ error: 'Некоректний ідентифікатор конспекту' });
    }
    const note = notes.find((item) => item.id === noteId);
    if (!note) {
        return res.status(404).json({ error: 'Конспект не знайдено' });
    }
    res.json(note);
});

app.post('/api/notes', async (req, res) => {
    try {
        const payload = req.body;

        if (!payload.title || !payload.subject) {
            return res.status(400).json({ error: "Поля 'title' та 'subject' обов'язкові" });
        }

        const id = payload.id ? Number(payload.id) : Date.now();
        const learned = Boolean(payload.isLearned ?? payload.learned);

        const note = {
            id,
            title: payload.title,
            subject: payload.subject,
            text: payload.text ?? '',
            pages: Number(payload.pages) || 1,
            date: payload.date || new Date().toISOString().split('T')[0],
            isLearned: learned,
            learned: learned
        };

        const index = notes.findIndex(item => item.id === id);

        if (index === -1) {
            notes.push(note);
        } else {
            notes[index] = { ...notes[index], ...note };
        }

        await saveNotesToFile();

        const statusCode = index === -1 ? 201 : 200;
        res.status(statusCode).json(notes[index === -1 ? notes.length - 1 : index]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка при збереженні даних' });
    }
});

app.delete('/api/notes/:id', async (req, res) => {
    try {
        const noteId = Number(req.params.id);
        const index = notes.findIndex(item => item.id === noteId);

        if (index === -1) {
            return res.status(404).json({ error: 'Конспект не найден' });
        }

        const [deletedNote] = notes.splice(index, 1);
        await saveNotesToFile();

        res.json(deletedNote);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при обновлении файла' });
        console.log(error);
    }
});

app.get(['/', '/notes/:id'], (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
});

app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не знайдено' });
});

app.listen(PORT, () => console.log('Сервер запущено на http://localhost:3000'));