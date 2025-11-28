// Document storage service using IndexedDB
export interface ProjectDocument {
    id: string;
    projectId: string;
    name: string;
    type: 'blueprint' | 'requirements';
    fileType: string; // .xlsx, .xls, .pdf
    uploadDate: string;
    fileSize: number;
    fileData: ArrayBuffer;
}

export interface MeetingNote {
    id: string;
    projectId: string;
    title: string;
    date: string;
    type: 'transcript' | 'minutes';
    content?: string; // For minutes or extracted text
    fileData?: ArrayBuffer; // For transcripts
    fileName?: string;
    fileType?: string;
    uploadDate: string;
}

const DB_NAME = 'CustomerCentralDB_v2';
const STORE_NAME = 'documents';
const NOTES_STORE_NAME = 'meeting_notes';
const DB_VERSION = 1;

class DocumentStorage {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    objectStore.createIndex('projectId', 'projectId', { unique: false });
                }

                if (!db.objectStoreNames.contains(NOTES_STORE_NAME)) {
                    const notesStore = db.createObjectStore(NOTES_STORE_NAME, { keyPath: 'id' });
                    notesStore.createIndex('projectId', 'projectId', { unique: false });
                }
            };
        });
    }

    // Document Methods
    async uploadDocument(document: Omit<ProjectDocument, 'id' | 'uploadDate'>): Promise<ProjectDocument> {
        await this.ensureDB();

        const newDocument: ProjectDocument = {
            ...document,
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            uploadDate: new Date().toISOString(),
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(newDocument);

            request.onsuccess = () => resolve(newDocument);
            request.onerror = () => reject(request.error);
        });
    }

    async getDocumentsByProject(projectId: string): Promise<ProjectDocument[]> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('projectId');
            const request = index.getAll(projectId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getDocument(id: string): Promise<ProjectDocument | undefined> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteDocument(id: string): Promise<void> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getAllDocuments(): Promise<ProjectDocument[]> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Meeting Note Methods
    async saveMeetingNote(note: Omit<MeetingNote, 'id' | 'uploadDate'>): Promise<MeetingNote> {
        await this.ensureDB();

        const newNote: MeetingNote = {
            ...note,
            id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            uploadDate: new Date().toISOString(),
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([NOTES_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(NOTES_STORE_NAME);
            const request = store.add(newNote);

            request.onsuccess = () => resolve(newNote);
            request.onerror = () => reject(request.error);
        });
    }

    async getMeetingNotesByProject(projectId: string): Promise<MeetingNote[]> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([NOTES_STORE_NAME], 'readonly');
            const store = transaction.objectStore(NOTES_STORE_NAME);
            const index = store.index('projectId');
            const request = index.getAll(projectId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteMeetingNote(id: string): Promise<void> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([NOTES_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(NOTES_STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async updateMeetingNote(note: MeetingNote): Promise<void> {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([NOTES_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(NOTES_STORE_NAME);
            const request = store.put(note);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    private async ensureDB(): Promise<void> {
        if (!this.db) {
            await this.init();
        }
    }
}

// Singleton instance
export const documentStorage = new DocumentStorage();

// Helper function to download a document
export function downloadDocument(doc: ProjectDocument): void {
    const blob = new Blob([doc.fileData], {
        type: getContentType(doc.fileType)
    });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = doc.name;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Helper function to get content type
function getContentType(fileType: string): string {
    const types: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xls': 'application/vnd.ms-excel',
    };
    return types[fileType] || 'application/octet-stream';
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
