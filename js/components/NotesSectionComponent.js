// js/components/NotesSectionComponent.js

import { NotesListView } from './NotesListView.js';

/**
 * Керує секцією конспектів: станами завантаження/помилки, панеллю інструментів та списком карток
 */
export class NotesSectionComponent {
    /**
     * @param {NotesDB} db - Екземпляр бази даних
     * @param {ParentNode} [root=document] - Батьківський вузол секції для пошуку елементів
     */
    constructor(db, root = document) {
        this.db = db;
        this.root = root;

        this.contentContainer = this.root.querySelector("#notes-list");
        this.loadingIndicator = this.root.querySelector("#loading-indicator");
        this.errorContainer = this.root.querySelector("#error-message");
        this.errorMessage = this.errorContainer ? this.errorContainer.querySelector("p") : null;

        this.counter = this.root.querySelector("#notes-count");
        this.filterSelect = this.root.querySelector("#subject-filter");
        this.refreshBtn = this.root.querySelector("#refresh-btn");

        this.listView = new NotesListView(this.contentContainer, this.db);

        this._setupFilterHook();
        this._initSectionEvents();
    }

    /**
     * Ініціалізує початкове відображення секції
     */
    async init() {
        await this.refresh();
        this.showContent();
    }

    /**
     * Перемальовує картки з урахуванням фільтра та синхронізує значення в тулбарі
     */
    async refresh() {
        await this.listView.render();
        this.updateToolbar();
    }

    /**
     * Перемикає відображення на індикатор завантаження
     */
    showLoading() {
        if (this.contentContainer) this.contentContainer.hidden = true;
        if (this.errorContainer) this.errorContainer.hidden = true;
        if (this.loadingIndicator) this.loadingIndicator.hidden = false;
        if (this.counter) this.counter.textContent = "Всього: — (сторінок: —)";
    }

    /**
     * Відображає повідомлення про помилку
     * @param {string} [message]
     */
    showError(message = "На жаль, сталася помилка під час завантаження контенту!") {
        if (this.contentContainer) this.contentContainer.hidden = true;
        if (this.loadingIndicator) this.loadingIndicator.hidden = true;
        if (this.errorContainer) this.errorContainer.hidden = false;
        if (this.errorMessage) this.errorMessage.textContent = message;
    }

    /**
     * Показує блок списку конспектів
     */
    showContent() {
        if (this.loadingIndicator) this.loadingIndicator.hidden = true;
        if (this.errorContainer) this.errorContainer.hidden = true;
        if (this.contentContainer) this.contentContainer.hidden = false;
    }

    /**
     * Скидає вибраний фільтр предметів до значення за замовчуванням
     */
    resetFilter() {
        if (this.filterSelect) {
            this.filterSelect.value = "all";
        }
    }

    /**
     * Зчитує агреговані метрики з вьюшки списку та виводить їх у лічильник
     */
    updateToolbar() {
        if (!this.counter) return;
        const count = this.listView.getDisplayedCount();
        const pages = this.listView.getDisplayedPagesCount();
        this.counter.textContent = `Всього: ${count} (сторінок: ${pages})`;
    }

    /**
     * Підключає значення випадаючого списку до конвеєра перед рендерингом
     */
    _setupFilterHook() {
        this.listView.setBeforeRender((items) => {
            const selected = this.filterSelect ? this.filterSelect.value : "all";
            return selected === "all" ? items : items.filter((note) => note.subject === selected);
        });
    }

    /**
     * Реєструє внутрішні слухачі елементів керування секції
     */
    _initSectionEvents() {
        if (this.filterSelect) {
            this.filterSelect.addEventListener("change", async () => {
                await this.refresh();
            });
        }

        if (this.refreshBtn) {
            this.refreshBtn.addEventListener("click", async () => {
                try {
                    this.showLoading();
                    await this.refresh();
                    this.showContent();
                } catch (error) {
                    this.showError("Не вдалося оновити конспекти!");
                    console.log(error);
                }
            });
        }
    }
}