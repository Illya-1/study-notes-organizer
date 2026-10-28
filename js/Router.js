export class Router {
    constructor(routes, appContainer, db) {
        this.routes = routes;
        this.appContainer = appContainer;
        this.db = db;

        addEventListener("popstate", () => this.handleRoute());

        document.addEventListener("click", (event) => {
            const link = event.target.closest("a[data-link]");
            if (!link) return;

            event.preventDefault();
            this.navigate(link.getAttribute("href")).catch();
        });
    }

    async navigate(path) {
        history.pushState(null, "", path);
        await this.handleRoute();
    }

    matchRoute(path) {
        const pathSegments = path.split("/").filter(Boolean);

        for (const route of this.routes) {
            const routeSegments = route.path.split("/").filter(Boolean);
            if (routeSegments.length !== pathSegments.length) continue;

            const params = {};
            const isMatch = routeSegments.every((segment, i) => {
                if (segment.startsWith(":")) {
                    params[segment.slice(1)] = decodeURIComponent(pathSegments[i]);
                    return true;
                }
                return segment === pathSegments[i];
            });

            if (isMatch) return { route, params };
        }

        return null;
    }

    async handleRoute() {
        const match = this.matchRoute(location.pathname);

        if (!match) {
            this._renderNotFound();
            return;
        }

        this.appContainer.replaceChildren();
        const ScreenClass = match.route.screen;
        const screen = new ScreenClass(this.appContainer, this, match.params);
        await screen.render();
    }

    _renderNotFound() {
        this.appContainer.innerHTML = `
            <section class="status-box error-box">
                <h2>404 — Сторінку не знайдено</h2>
                <p>Запитуваного розділу або конспекту не існує.</p>
                <a href="/" data-link class="btn-back">Повернутися на головну</a>
            </section>
        `;
    }
}