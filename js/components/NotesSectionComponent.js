import { NotesListView } from './NotesListView.js';

export class NotesSectionComponent {
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
        this.progressFill = this.root.querySelector("#progress-fill");

        this.listView = new NotesListView(this.contentContainer, this.db);

        // Підписуємося на єдину подію зміни стану відображення
        this.listView.onDisplayStateChanged = (state) => {
            this.updateToolbar(state);
        };

        this._setupFilterHook();
        this._initSectionEvents();
    }

    async init() {
        await this.refresh();
        this.showContent();
    }

    async refresh() {
        await this.listView.render();
    }

    showLoading() {
        if (this.contentContainer) this.contentContainer.hidden = true;
        if (this.errorContainer) this.errorContainer.hidden = true;
        if (this.loadingIndicator) this.loadingIndicator.hidden = false;
        if (this.counter) this.counter.textContent = "Всього: — (сторінок: —)";
    }

    showError(message = "На жаль, сталася помилка під час завантаження контенту!") {
        if (this.contentContainer) this.contentContainer.hidden = true;
        if (this.loadingIndicator) this.loadingIndicator.hidden = true;
        if (this.errorContainer) this.errorContainer.hidden = false;
        if (this.errorMessage) this.errorMessage.textContent = message;
    }

    showContent() {
        if (this.loadingIndicator) this.loadingIndicator.hidden = true;
        if (this.errorContainer) this.errorContainer.hidden = true;
        if (this.contentContainer) this.contentContainer.hidden = false;
    }

    resetFilter() {
        if (this.filterSelect) {
            this.filterSelect.value = "all";
        }
    }

    /**
     * Оновлює лічильники та анімує прогрес-бар (через CSS transition ширини) згідно з наданим станом
     * @param {{total: number, learned: number, pages: number, percent: number}} [state]
     */
    updateToolbar(state) {
        const currentState = state || this.listView.getDisplayState();

        if (this.counter) {
            this.counter.textContent = `Всього: ${currentState.total} (вивчено: ${currentState.learned}, стор: ${currentState.pages})`;
        }

        if (this.progressFill) {
            this.progressFill.style.width = `${currentState.percent}%`;

            const track = this.progressFill.closest('[role="progressbar"]');
            if (track) {
                track.setAttribute("aria-valuenow", String(currentState.percent));
            }
        }
    }

    _setupFilterHook() {
        this.listView.setBeforeRender((items) => {
            const selected = this.filterSelect ? this.filterSelect.value : "all";
            return selected === "all" ? items : items.filter((note) => note.subject === selected);
        });
    }

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