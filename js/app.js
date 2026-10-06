const notes = [
    // {
    //     subject: "Математичний аналіз",
    //     topic: "Інтеграл. Повторення",
    //     pages: 2,
    //     examSoon: false,
    //     id: 0
    // },
    // {
    //     subject: "Математичний аналіз",
    //     topic: "Кратні інтеграли. Частина 1",
    //     pages: 5,
    //     examSoon: false,
    //     id: 1
    // },
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
const notesDisplayWindow = document.querySelector("#notes-list");
const loadDisplayWindow = document.querySelector("#loading-indicator");
const errorDisplayWindow = document.querySelector("#error-message");

const notesCounter = document.querySelector("#notes-count");
const refreshBtn = document.querySelector("#refresh-btn");

const API_URL = "https://jsonplaceholder.typicode.com/posts?userId=2";

//main метод, збирає в одному блоці весь код який має запускатись при завантаженні сторінки і який не є event handler-ом
async function main(){
    await loadData(notes);
    renderCards(notes, notesDisplayWindow);
}

main()

// === RENDERING ===

// Створює DOM-вузол картки конспекту із заголовком, зображенням, назвою предмета та умовним класом exam-soon
function buildCard(note) {
    const card = document.createElement("article");

    const topic = note.topic;
    const p = note.subject;
    const isExamSoon = note.examSoon;
    
    card.className = `card ${isExamSoon ? "exam-soon" : ""}`;
    card.dataset.subject = p;
    card.dataset.id = note.id;
    //<img src="${note.imgSrc || 'https://placehold.co/600x400'}" alt="${note.imgAlt || `Конспект: ${topic}`}">
    card.innerHTML = `
        <h3>${topic}</h3>
        
        <footer>
            <p>${p}</p>
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
        container.append(buildCard(note));
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
    renderCards(notes, notesDisplayWindow);

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
notesDisplayWindow.addEventListener('change', (event) => {
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


//Listner для оновлення списку карток після натискання на кнопку перезавантаження
refreshBtn.addEventListener("click", async () => {
    notes.length = 0;
    notesCounter.textContent = "Всього: — (сторінок: —)";

    await loadData(notes);
    renderCards(notes, notesDisplayWindow);
});

//=== EVENT HANDLERS ===



//=== NETWORK ===

//Функція для завантаження даних з API_URL за допомогою fetch api. Отримані дані адаптуються до формату даних з яким працює логіка сторінки 
async function loadData(dataContainer) {
    try{
        notesDisplayWindow.hidden = true;
        errorDisplayWindow.hidden = true;
        loadDisplayWindow.hidden = false;
        const response = await fetch(API_URL);
        if(!response.ok){
            throw new Error(`Помилка сервера: ${response.status}`);
        }

        const data = await response.json();

        console.log(data)
        for(const item of data){
            dataContainer.push({
                id: item.id,
                topic: item.title, 
                subject: item.body,
                pages: 1,
                examSoon: false
            });
        }
        notesDisplayWindow.hidden = false;
    }
    catch(error){
        console.error(error);
        errorDisplayWindow.hidden = false;
    }
    finally{
        loadDisplayWindow.hidden = true;
    }
}

//=== NETWORK ===