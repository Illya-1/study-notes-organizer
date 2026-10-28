import { NotesListView } from './NotesListView.js';

export class NotesSectionComponent {
    /**
     * @param {HTMLElement} parentContainer
     * @param {NotesDB} db
     * @param {Function|null} onFilterChange
     */
    constructor(parentContainer, db, onFilterChange = null) {
        this.parentContainer = parentContainer;
        this.db = db;
        this.onFilterChange = onFilterChange;

        this._renderLayout();

        this.contentContainer = this.section.querySelector("#notes-list");
        this.loadingIndicator = this.section.querySelector("#loading-indicator");
        this.errorContainer = this.section.querySelector("#error-message");
        this.errorMessage = this.section.querySelector("#error-message p");

        this.counter = this.section.querySelector("#notes-count");
        this.filterSelect = this.section.querySelector("#subject-filter");
        this.refreshBtn = this.section.querySelector("#refresh-btn");
        this.progressFill = this.section.querySelector("#progress-fill");
        this.progressTrack = this.section.querySelector('[role="progressbar"]');

        this.listView = new NotesListView(this.contentContainer, this.db);
        this.listView.onDisplayStateChanged = (state) => {
            this.updateToolbar(state);
        }

        this._setupFilterHook();
        this._initSectionEvents();
    }

    _renderLayout() {
        this.section = document.createElement("section");
        this.section.innerHTML = `
            <header class="notes-section-header">
                <div class="header-main-row">
                    <h2>Всі конспекти</h2>
                    <div class="header-controls">
                        <div class="controls-status">
                            <p id="notes-count">Всього: — (сторінок: —)</p>
                            <button type="button" id="refresh-btn" aria-label="Оновити конспекти">&#x21bb;</button>
                        </div>
                        <div class="filter-wrapper">
                            <select id="subject-filter" aria-label="Фільтр за предметом">
                                <option value="all">Усі предмети</option>
                                <option value="Математичний аналіз">Математичний аналіз</option>
                                <option value="Веб-програмування">Веб-програмування</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="progress-track" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                    <div id="progress-fill" class="progress-fill"></div>
                </div>
            </header>

            <div id="loading-indicator" class="status-box" hidden>
                <div class="spinner"></div>
                <p>Завантаження конспектів...</p>
            </div>

            <div id="error-message" class="status-box error-box" hidden>
                <p>Конспекти тимчасово недоступні</p>
            </div>
            
            <div id="notes-list" class="cards-container" hidden></div>
        `;
        this.parentContainer.append(this.section);
    }

    async init() {
        await this.refresh();
        this.showContent();
    }

    async refresh() {
        await this.listView.render();
    }

    setFilter(subject) {
        this.filterSelect.value = subject || "all";
    }

    showLoading() {
        this.contentContainer.hidden = true;
        this.errorContainer.hidden = true;
        this.loadingIndicator.hidden = false;
        this.counter.textContent = "Всього: — (сторінок: —)";
    }

    showError(message = "На жаль, сталася помилка під час завантаження контенту!") {
        this.contentContainer.hidden = true;
        this.loadingIndicator.hidden = true;
        this.errorContainer.hidden = false;
        this.errorMessage.textContent = message;
    }

    showContent() {
        this.loadingIndicator.hidden = true;
        this.errorContainer.hidden = true;
        this.contentContainer.hidden = false;
    }

    updateToolbar(state) {
        const current = state || this.listView.getDisplayState();

        this.counter.textContent = `Всього: ${current.total} (вивчено: ${current.learned}, стор: ${current.pages})`;
        this.progressFill.style.width = `${current.percent}%`;
        this.progressTrack.setAttribute("aria-valuenow", String(current.percent));
    }

    _setupFilterHook() {
        this.listView.setBeforeRender((items) => {
            const selected = this.filterSelect.value;
            return selected === "all" ? items : items.filter((note) => note.subject === selected);
        });
    }

    _initSectionEvents() {
        this.filterSelect.addEventListener("change", async () => {
            if (this.onFilterChange) {
                this.onFilterChange(this.filterSelect.value);
            } else {
                await this.refresh();
            }
        });

        this.refreshBtn.addEventListener("click", async () => {
            try {
                this.showLoading();
                await this.refresh();
                this.showContent();
            } catch (error) {
                this.showError("Не вдалося оновити конспекти!");
                console.error(error);
            }
        });
    }
}