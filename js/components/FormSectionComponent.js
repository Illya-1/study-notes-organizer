export class FormSectionComponent {
    constructor(container, db, onNoteCreated = null) {
        this.container = container;
        this.db = db;
        this.onNoteCreated = onNoteCreated;
        this.form = null;
        this.titleInput = null;
    }

    render() {
        const section = document.createElement("section");
        section.className = "form-section";
        section.innerHTML = `
            <h2>Додати новий конспект</h2>
            <div class="form-container">
                <form id="note-form">
                    <div class="form-field">
                        <label for="form-subject-select">Предмет:</label>
                        <select name="subject" id="form-subject-select" required>
                            <option value="" disabled selected hidden>Оберіть предмет</option>
                            <option value="Математичний аналіз">Математичний аналіз</option>
                            <option value="Веб-програмування">Веб-програмування</option>
                        </select>
                    </div>

                    <div class="form-field">
                        <label for="form-topic-input">Тема конспекту:</label>
                        <input 
                            type="text" 
                            id="form-topic-input" 
                            name="title" 
                            required 
                            pattern=".{3,}" 
                            placeholder="Мінімум 3 символи"
                        >
                    </div>

                    <div class="form-field">
                        <label for="form-pages-input">Кількість сторінок:</label>
                        <input 
                            type="number" 
                            id="form-pages-input" 
                            name="pages" 
                            required 
                            min="1" 
                            value="1"
                        >
                    </div>

                    <div class="form-field">
                        <label for="form-text-input">Короткий зміст (текст):</label>
                        <textarea 
                            id="form-text-input" 
                            name="text" 
                            rows="3" 
                            placeholder="Основні тези або опис конспекту..." 
                            required
                        ></textarea>
                    </div>

                    <div class="form-checkbox">
                        <input type="checkbox" id="note-exam-soon" name="learned">
                        <label for="note-exam-soon">Вивчено</label>
                    </div>

                    <button type="submit">Додати конспект</button>
                </form>

                <div class="form-info-card">
                    <h3>Пам'ятка студента</h3>
                    <p>Вказуйте точну тему та кількість сторінок конспекту для коректного обрахунку щоденного навантаження.</p>
                    <p>Прапорець <strong>«Скоро екзамен»</strong> автоматично підсвітить конспект у списку червоною рамкою для швидкого доступу під час сесії.</p>
                </div>
            </div>
        `;

        this.container.append(section);
        this.form = section.querySelector("#note-form");
        this.titleInput = section.querySelector("#form-topic-input");

        this._initEvents();
    }

    _initEvents() {
        this.titleInput.addEventListener("input", () => {
            const message = this.titleInput.validity.patternMismatch
                ? "Тема має містити щонайменше 3 символи"
                : "";
            this.titleInput.setCustomValidity(message);
        });

        this.form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const elements = this.form.elements;
            const newNote = {
                id: Date.now(),
                subject: elements.subject.value,
                title: elements.title.value.trim(),
                text: elements.text.value.trim(),
                pages: Number(elements.pages.value),
                learned: elements.learned.checked,
                date: new Date().toISOString().split("T")[0]
            };

            await this.db.addItem(newNote);
            this.form.reset();

            if (this.onNoteCreated) {
                this.onNoteCreated(newNote);
            }
        });
    }
}