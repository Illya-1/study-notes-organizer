import {escapeHtml} from "../util";

export class NoteDetailsScreen {
    /**
     * @param {HTMLElement} container
     * @param {Router} router
     * @param {{id?: string}} params
     */
    constructor(container, router, params = {}) {
        this.container = container;
        this.router = router;
        this.params = params;
        this.db = router.db;
    }

    async render() {
        this.container.replaceChildren();

        const noteId = Number(this.params.id);
        const note = await this.db.getItem(noteId);

        if (!note) {
            this.container.innerHTML = `
                <section class="status-box error-box">
                    <h2>Конспект не знайдено</h2>
                    <p>Конспект з ID #${escapeHtml(this.params.id)} не існує або був видалений.</p>
                    <a href="/" data-link class="btn-back">Повернутися до списку</a>
                </section>
            `;
            return;
        }

        const isLearned = Boolean(note.isLearned);

        const section = document.createElement("section");
        section.className = "note-details-section";
        section.innerHTML = `
            <article class="note-details-card ${isLearned ? "card-learned" : ""}">
                <header class="note-details-header">
                    <div class="note-details-tags">
                        <span class="note-subject-badge">${escapeHtml(note.subject)}</span>
                        <span class="note-status-badge ${isLearned ? "status-learned" : "status-pending"}">
                            ${isLearned ? "✓ Вивчено" : "⏳ В процесі"}
                        </span>
                    </div>
                    <time class="note-date">${escapeHtml(note.date)}</time>
                </header>

                <h2 class="note-details-title">${escapeHtml(note.title)}</h2>

                <div class="note-details-body">
                    <p>${escapeHtml(note.text)}</p>
                </div>

                <footer class="note-details-footer">
                    <span class="note-pages-count">Обсяг: <strong>${escapeHtml(note.pages || 1)}</strong> стор.</span>
                    <a href="/" data-link class="btn-back">← Назад до конспектів</a>
                </footer>
            </article>
        `;

        this.container.append(section);
    }
}