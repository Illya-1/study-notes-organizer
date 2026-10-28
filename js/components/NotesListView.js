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
        this.onDisplayStateChanged = null; // Хук/коллбек стану відображення

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

    JavaScript
    /**
     * Розраховує поточні метрики прогресу та агрегати виключно для відображених карток
     * @returns {{total: number, learned: number, pages: number, percent: number}}
     */
    getDisplayState() {
        const total = this._renderedItems.length;
        const learned = this._renderedItems.filter(item => Boolean(item.isLearned || item.learned)).length;
        const pages = this._renderedItems.reduce((sum, item) => sum + (Number(item.pages) || 0), 0);
        const percent = total > 0 ? Math.round((learned / total) * 100) : 0;

        return { total, learned, pages, percent };
    }

    /**
     * Сповіщає зовнішніх слухачів про зміну агрегованих даних відображення
     */
    _notifyStateChanged() {
        if (typeof this.onDisplayStateChanged === "function") {
            this.onDisplayStateChanged(this.getDisplayState());
        }
    }

    /**
     * Зчитує актуальні дані з БД, пропускає через хук та виконує рендеринг у DOM
     */
    async render() {
        this._rawItems = await this.db.getAllItems();
        this._renderedItems = this._beforeRenderHook([...this._rawItems]);
        this._renderCards(this._renderedItems);
        this._notifyStateChanged();
    }

    getDisplayedCount() {
        return this._renderedItems.length;
    }

    getDisplayedPagesCount() {
        return this._renderedItems.reduce((sum, item) => sum + (item.pages || 0), 0);
    }

    getTotalCount() {
        return this._rawItems.length;
    }

    getLearnedCount() {
        return this._rawItems.filter(item => item.learned || item.isLearned).length;
    }

    /**
     * Ініціалізує делеговані слухачі подій контейнера для видалення та оновлення статусу
     */
    _initCardEvents() {
        this.container.addEventListener("click", async (event) => {
            const deleteBtn = event.target.closest(".btn-delete");
            if (!deleteBtn) return;

            const card = deleteBtn.closest("[data-id]");
            if (!card) return;

            const noteId = Number(card.dataset.id);
            await this.db.deleteItem(noteId);
            await this.render();
        });

        this.container.addEventListener("change", async (event) => {
            if (event.target.name !== "learned" && event.target.name !== "isLearned") return;

            const card = event.target.closest("[data-id]");
            if (!card) return;

            const noteId = Number(card.dataset.id);
            const isChecked = event.target.checked;

            card.classList.toggle("learned", isChecked);

            const targetNote = this._rawItems.find(n => n.id === noteId);
            if (!targetNote) return;

            targetNote.isLearned = isChecked;
            await this.db.addItem(targetNote);

            // МИТТЄВО повідомляємо тулбар про зміну без важкого рендеру всього DOM
            this._notifyStateChanged();
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
        const isLearned = Boolean(note.learned || note.isLearned);

        card.className = `card ${isLearned ? "learned" : ""}`;
        card.dataset.subject = note.subject;
        card.dataset.id = note.id;

        card.innerHTML = `
            <header>
                <div class="card-header-top">
                    <h3>
                        <a href="/notes/${note.id}" data-link="">${note.title}</a>
                    </h3>
                    <button type="button" class="btn-delete" title="Видалити конспект" aria-label="Видалити конспект">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12z"/>
                        </svg>
                    </button>
                </div>
                <span class="badge-subject">${note.subject}</span>
            </header>

            <p class="card-text">${note.text || "NOTEXT"}</p>

            <footer>
                <time datetime="${note.date}">${note.date}</time>
                <label>
                    <input type="checkbox" name="isLearned" ${isLearned ? "checked" : ""}>
                    Вивчено
                </label>
            </footer>
        `;

        return card;
    }
}