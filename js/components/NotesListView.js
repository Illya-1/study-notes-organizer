/**
 * Керує контейнером списку карток, рендерингом та подіями взаємодії з конспектами
 */
export class NotesListView {
    /**
     * @param {HTMLElement} container
     * @param {NotesDB} db
     */
    constructor(container, db) {
        this.container = container;
        this.db = db;

        this._rawItems = [];
        this._renderedItems = [];

        this._beforeRenderHook = (items) => items;

        this.onEditNote = null;

        this._initCardEvents();
    }

    /**
     * Реєструє функцію-модифікатор списку перед етапом відмальовування
     * @param {(items: Object[]) => Object[]} hookFunction
     */
    setBeforeRender(hookFunction) {
        if (typeof hookFunction === 'function') {
            this._beforeRenderHook = hookFunction;
        }
    }

    /**
     * Зчитує актуальні дані з БД, пропускає через хук та виконує рендеринг у DOM
     */
    async render() {
        this._rawItems = await this.db.getAllItems();
        this._renderedItems = this._beforeRenderHook([...this._rawItems]);
        this._renderCards(this._renderedItems);
    }

    /**
     * Повертає кількість конспектів, відображених на екрані
     * @returns {number}
     */
    getDisplayedCount() {
        return this._renderedItems.length;
    }

    /**
     * Повертає сумарну кількість сторінок для конспектів на екрані
     * @returns {number}
     */
    getDisplayedPagesCount() {
        return this._renderedItems.reduce((sum, item) => sum + (item.pages || 0), 0);
    }

    /**
     * Повертає загальну кількість усіх записів у базі
     * @returns {number}
     */
    getTotalCount() {
        return this._rawItems.length;
    }

    /**
     * Повертає кількість опрацьованих тем серед усіх записів
     * @returns {number}
     */
    getLearnedCount() {
        return this._rawItems.filter(item => Boolean(item.isLearned)).length;
    }

    /**
     * Ініціалізує делеговані слухачі подій контейнера для видалення та оновлення статусу
     */
    _initCardEvents() {
        this.container.addEventListener("click", async (event) => {
            const actionTarget = event.target.closest("[data-action]");
            if (!actionTarget) return;

            const card = actionTarget.closest("[data-id]");
            if (!card) return;

            const noteId = Number(card.dataset.id);
            const action = actionTarget.dataset.action;

            if (action === "edit") {
                const note = this._rawItems.find(n => n.id === noteId);
                if (note && typeof this.onEditNote === "function") {
                    this.onEditNote(note);
                }
            } else if (action === "delete") {
                await this.db.deleteItem(noteId);
                await this.render();
            }
        });

        this.container.addEventListener("change", async (event) => {
            if (event.target.name !== "learned") return;

            const card = event.target.closest("[data-id]");
            if (!card) return;

            const noteId = Number(card.dataset.id);
            const isChecked = event.target.checked;
            
            card.classList.toggle("learned", isChecked);

            const targetNote = this._rawItems.find(n => n.id === noteId);
            if (!targetNote) return;

            // В об'єкті бази фіксуємо виключно isLearned
            targetNote.isLearned = isChecked;
            delete targetNote.learned;

            await this.db.addItem(targetNote);
        });
    }

    /**
     * Формує DOM-структуру та наповнює контейнер
     * @param {Object[]} items
     */
    _renderCards(items) {
        this.container.innerHTML = "";

        const fragment = document.createDocumentFragment();
        for (const note of items) {
            fragment.append(this.buildCard(note));
        }
        this.container.append(fragment);
    }

    /**
     * Створює окремий DOM-вузол картки
     * @param {Object} note
     * @returns {HTMLElement}
     */
    buildCard(note) {
        const card = document.createElement("article");
        const isLearned = Boolean(note.isLearned);
        
        card.className = `card ${isLearned ? "learned" : ""}`;
        card.dataset.subject = note.subject;
        card.dataset.id = note.id;

        card.innerHTML = `
            <header>
                <div class="card-header-top">
                    <h3>${note.title}</h3>
                    <div class="card-actions">
                        <button type="button" class="card-button edit-button" data-action="edit" title="Редагувати конспект" aria-label="Редагувати конспект">
                            ✏️
                        </button>
                        <button type="button" class="card-button delete-button" data-action="delete" title="Видалити конспект" aria-label="Видалити конспект">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <span class="badge-subject">${note.subject}</span>
            </header>

            <p class="card-text">${note.text || "NOTEXT"}</p>

            <footer>
                <time datetime="${note.date}">${note.date}</time>
                <label>
                    <input type="checkbox" name="learned" ${isLearned ? "checked" : ""}>
                    Вивчено
                </label>
            </footer>
        `;

        return card;
    }
}