const notes = [
    {
        subject: "Математичний аналіз",
        topic: "Інтеграл. Повторення",
        pages: 2,
        examSoon: false
    },
    {
        subject: "Математичний аналіз",
        topic: "Кратні інтеграли. Частина 1",
        pages: 5,
        examSoon: false
    },
    {
        subject: "Математичний аналіз",
        topic: "Кратні інтеграли. Паттерни розв'язання",
        pages: 4,
        examSoon: true
    },
    {
        subject: "Веб-програмування",
        topic: "Flexbox",
        pages: 4,
        examSoon: true
    },
    {
        subject: "Веб-програмування",
        topic: "Grid та його використання",
        pages: 3,
        examSoon: true
    },
    {
        subject: "Веб-програмування",
        topic: "Адаптивна верстка та Media Queries",
        pages: 1,
        examSoon: false
    }
];

const notesListContainer = document.querySelector("#notes-list");
const notesCounter = document.querySelector("#notes-count");

// Створює DOM-вузол картки конспекту із заголовком, зображенням, назвою предмета та умовним класом exam-soon
function buildCard(note) {
    const card = document.createElement("article");
    card.classList.add("card");
    card.dataset.subject = note.subject;

    if (note.examSoon) {
        card.classList.add("exam-soon");
    }

    const h3 = document.createElement("h3");
    h3.textContent = note.topic;

    const img = document.createElement("img");
    img.src = note.imgSrc || "https://placehold.co/600x400";
    img.alt = note.imgAlt || `Конспект: ${note.topic}`;

    const p = document.createElement("p");
    p.textContent = note.subject;

    card.append(h3, img, p);
    return card;
}

// Очищує контейнер і рендерить переданий масив конспектів у DOM, оновлюючи лічильник
function renderCards(items, container = notesListContainer) {
    if (!container) return;

    container.innerHTML = "";

    for (const note of items) {
        container.append(buildCard(note));
    }

    updateNotesCounter(items);
}

// Обраховує загальну кількість конспектів та сторінок і виводить значення в елемент #notes-count
function updateNotesCounter(items) {
    const counter = document.querySelector("#notes-count");
    if (!counter) return;

    const totalPages = items.reduce((sum, item) => sum + item.pages, 0);
    counter.textContent = `Всього: ${items.length} (сторінок: ${totalPages})`;
}

//Рахує кількість сторінок яку треба читати за день щоб встигнути прочитати всі сторінку конспекту до екзамену
const pagesPerDay = (pages, daysLeft) => Math.ceil(pages / daysLeft);
const pages = 10;
const daysLeft = 3;
console.log(`Щоб встигнути перечитати конспекти до екзамена потрібно читати ${pagesPerDay(pages, daysLeft)} сторінок на день`)


renderCards(notes);