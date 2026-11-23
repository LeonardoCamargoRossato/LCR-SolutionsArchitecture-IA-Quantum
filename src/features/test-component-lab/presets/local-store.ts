import type { StoredPreset } from '../editor/document-model'

const NAME = 'lcr-test-component-lab-v2'
const VERSION = 1

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(Error('IndexedDB indisponível neste navegador.'))
    const request = indexedDB.open(NAME, VERSION)
    request.onerror = () => reject(request.error || Error('Não foi possível abrir o armazenamento local.'))
    request.onupgradeneeded = () => {
      const current = request.result
      if (!current.objectStoreNames.contains('presets')) current.createObjectStore('presets', { keyPath: 'id' })
      if (!current.objectStoreNames.contains('images')) current.createObjectStore('images')
    }
    request.onsuccess = () => resolve(request.result)
  })
}
async function transact<T>(store: 'images' | 'presets', mode: IDBTransactionMode, action: (objectStore: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await db()
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(store, mode)
    const request = action(transaction.objectStore(store))
    let result: T
    request.onsuccess = () => { result = request.result }
    request.onerror = () => reject(request.error || Error('Falha no armazenamento.'))
    transaction.oncomplete = () => { database.close(); resolve(result) }
    transaction.onerror = () => { database.close(); reject(transaction.error || Error('Falha ao salvar.')) }
    transaction.onabort = () => { database.close(); reject(transaction.error || Error('Operação cancelada.')) }
  })
}
export const localStore = {
  putImage: async (id: string, file: Blob) => transact('images','readwrite', s=>s.put(file,id)),
  getImage: async (id: string) => transact<Blob|undefined>('images','readonly',s=>s.get(id)),
  putPreset: async (preset: StoredPreset) => transact('presets','readwrite',s=>s.put(preset)),
  getPreset: async (id: string) => transact<StoredPreset|undefined>('presets','readonly',s=>s.get(id)),
  listPresets: async () => (await transact<StoredPreset[]>('presets','readonly',s=>s.getAll())).sort((a,b)=>b.savedAt.localeCompare(a.savedAt)),
  removePreset: async (id: string) => transact('presets','readwrite',s=>s.delete(id)),
}
