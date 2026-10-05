const notes = [
    {
        subject: "Математичний аналіз",
        topic: "Інтеграл. Повторення",
        pages: 2,
        examSoon: false,
        id: 0
    },
    {
        subject: "Математичний аналіз",
        topic: "Кратні інтеграли. Частина 1",
        pages: 5,
        examSoon: false,
        id: 1
    },
    // {
    //     subject: "Математичний аналіз",
    //     topic: "Кратні інтеграли. Паттерни розв'язання",
    //     pages: 4,
    //     examSoon: true,
    //     id: 2
    // },
    // {
    //     subject: "Веб-програмування",
    //     topic: "Flexbox",
    //     pages: 4,
    //     examSoon: true,
    //     id: 3
    // },
    // {
    //     subject: "Веб-програмування",
    //     topic: "Grid та його використання",
    //     pages: 3,
    //     examSoon: true,
    //     id: 4
    // },
    // {
    //     subject: "Веб-програмування",
    //     topic: "Адаптивна верстка та Media Queries",
    //     pages: 1,
    //     examSoon: false,
    //     id: 5
    // }
];

// Створює DOM-вузол картки конспекту із заголовком, зображенням, назвою предмета та умовним класом exam-soon
function buildCard(note) {
    const card = document.createElement("article");
    card.className = `card ${note.examSoon ? "exam-soon" : ""}`;
    card.dataset.subject = note.subject;
    card.dataset.id = note.id;

    card.innerHTML = `
        <h3>${note.topic}</h3>
        <img src="${note.imgSrc || 'https://placehold.co/600x400'}" alt="${note.imgAlt || `Конспект: ${note.topic}`}">
        <footer>
            <p>${note.subject}</p>
            <label>
                <input type="checkbox" name="examSoon" ${note.examSoon ? "checked" : ""}>
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


const notesListContainer = document.querySelector("#notes-list");
const notesCounter = document.querySelector("#notes-count");

renderCards(notes, notesListContainer);


// Обробник надсилання форми: валідує вхідні дані, створює новий конспект,
// оновлює інтерфейс списку та скидає поля форми
const form = document.querySelector("#note-form");
form.addEventListener("submit", (event)=>{
    event.preventDefault();
    
    const subjectValue = form.elements.subject.value;
    const topicValue = form.elements.topic.value.trim();
    const pagesValue = Number(form.elements.pages.value);
    const isExamSoon = form.elements.examSoon.checked;

    const newNote = {
        subject: subjectValue,
        topic: topicValue,
        pages: pagesValue,
        examSoon: isExamSoon,
        id: Date.now(),
    };

    notes.push(newNote);
    renderCards(notes, notesListContainer);

    form.reset();
})

// Додаткова валідація поля topic: підміна стандартного системного повідомлення
// браузера на зрозумілу українську підказку при невідповідності патерну
const topicInput = document.querySelector('#form-topic-input');
topicInput.addEventListener("input", (event) =>{
    if(topicInput.validity.patternMismatch){
        topicInput.setCustomValidity('Тема має містити щонайменше 3 символи');
    }
    else{
        topicInput.setCustomValidity('');
    }
})

// Делегування події change на контейнері карток: синхронізує стан
// властивості examSoon у масиві notes та оновлює стилі підсвітки картки
notesListContainer.addEventListener('change', (event) => {
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
    cardElement.classList.toggle('exam-soon', event.target.checked);
});