import { FormSectionComponent } from "../components/FormSectionComponent.js";
import { NotesSectionComponent } from "../components/NotesSectionComponent.js";

/**
 * Головний екран списку конспектів із формою створення
 */
export class NotesScreen {
    /**
     * @param {HTMLElement} container
     * @param {Router} router
     * @param {Object} [params]
     */
    constructor(container, router, params = {}) {
        this.container = container;
        this.router = router;
        this.params = params;
        this.db = router.db;
    }

    async render() {
        this.container.replaceChildren();

        const formSection = new FormSectionComponent(this.container, this.db, async () => {
            await notesSection.refresh();
        });
        formSection.render();

        const notesSection = new NotesSectionComponent(this.container, this.db, (selectedSubject) => {
            const path = selectedSubject === "all" ? "/" : `/subject/${encodeURIComponent(selectedSubject)}`;
            this.router.navigate(path);
        });

        if (this.params.subject) {
            notesSection.setFilter(this.params.subject);
        }

        await notesSection.init();
    }
}