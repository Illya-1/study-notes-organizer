export class NotesDB {
    constructor(dbName = 'NotesDB', version = 1, storeName = 'notes') {
        this.dbName = dbName;
        this.version = version;
        this.storeName = storeName;
        this._db = null;
    }

    open() {
        //throw new Error('Testing error');
        if (this._db) {
            return this._db;
        }
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
            request.onsuccess = (event) => {
                this._db = event.target.result;
                
                this._db.onclose = () => {
                    this._db = null;
                };

                resolve(this._db);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getDatabase() {
        try {
            return await this.open();
        } catch (error) {
            console.error("Помилка відкриття IndexedDB:", error);
            throw error;
        }
    }

    async addItem(item) {
        const db = await this.getDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(item);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllItems() {
        const db = await this.getDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteItem(id) {
        const db = await this.getDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}