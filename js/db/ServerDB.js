export class ServerDB {
    constructor(baseUrl = '/api/notes') {
        this.baseUrl = baseUrl;
    }

    async open() {
        return true;
    }

    async getDatabase() {
        return true;
    }

    async getAllItems() {
        const response = await fetch(this.baseUrl);
        if (!response.ok) {
            throw new Error(`Помилка завантаження конспектів: ${response.status}`);
        }
        return await response.json();
    }

    async getItem(id) {
        const response = await fetch(`${this.baseUrl}/${id}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Помилка завантаження конспекту: ${response.status}`);
        }
        return await response.json();
    }

    async addItem(item) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Помилка додавання конспекту: ${response.status}`);
        }

        return await response.json();
    }

    async deleteItem(id) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Помилка видалення конспекту: ${response.status}`);
        }

        return await response.json();
    }
}