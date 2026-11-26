import { AuditLogEntry, Household, PinConfig, Resident } from '../types/population';

const DB_NAME = 'EaWerDanCuDB';
const DB_VERSION = 1;

const STORES = {
  HOUSEHOLDS: 'households',
  RESIDENTS: 'residents',
  AUDIT_LOGS: 'auditLogs',
  SETTINGS: 'settings',
} as const;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Trình duyệt không hỗ trợ IndexedDB.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.HOUSEHOLDS)) {
        const hhStore = db.createObjectStore(STORES.HOUSEHOLDS, { keyPath: 'id' });
        hhStore.createIndex('maHoKhau', 'maHoKhau', { unique: true });
      }
      if (!db.objectStoreNames.contains(STORES.RESIDENTS)) {
        const resStore = db.createObjectStore(STORES.RESIDENTS, { keyPath: 'id' });
        resStore.createIndex('householdId', 'householdId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.AUDIT_LOGS)) {
        db.createObjectStore(STORES.AUDIT_LOGS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Không thể mở cơ sở dữ liệu cục bộ.'));
  });
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as T[]) || []);
    req.onerror = () => reject(req.error);
  });
}

async function putInStore<T>(storeName: string, item: T): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteFromStore(storeName: string, key: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadAllDatabaseData(): Promise<{
  households: Household[];
  residents: Resident[];
  auditLogs: AuditLogEntry[];
}> {
  const [households, residents, auditLogs] = await Promise.all([
    getAllFromStore<Household>(STORES.HOUSEHOLDS),
    getAllFromStore<Resident>(STORES.RESIDENTS),
    getAllFromStore<AuditLogEntry>(STORES.AUDIT_LOGS),
  ]);

  households.sort((a, b) => a.maHoKhau.localeCompare(b.maHoKhau));
  residents.sort((a, b) => a.hoTen.localeCompare(b.hoTen, 'vi'));
  auditLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return { households, residents, auditLogs };
}

export async function saveHouseholdRecord(household: Household): Promise<void> {
  await putInStore(STORES.HOUSEHOLDS, household);
}

export async function deleteHouseholdWithResidents(householdId: string): Promise<void> {
  const db = await openDatabase();
  const residents = await getAllFromStore<Resident>(STORES.RESIDENTS);
  const memberIds = residents.filter((r) => r.householdId === householdId).map((r) => r.id);

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.HOUSEHOLDS, STORES.RESIDENTS], 'readwrite');
    tx.objectStore(STORES.HOUSEHOLDS).delete(householdId);
    const resStore = tx.objectStore(STORES.RESIDENTS);
    for (const id of memberIds) {
      resStore.delete(id);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveResidentRecord(resident: Resident): Promise<void> {
  await putInStore(STORES.RESIDENTS, resident);
}

export async function deleteResidentRecord(residentId: string): Promise<void> {
  await deleteFromStore(STORES.RESIDENTS, residentId);
}

export async function appendAuditLog(entry: AuditLogEntry): Promise<void> {
  await putInStore(STORES.AUDIT_LOGS, entry);
}

export async function replaceAllDatabaseData(
  households: Household[],
  residents: Resident[],
  auditLogs?: AuditLogEntry[]
): Promise<void> {
  const db = await openDatabase();
  const stores = auditLogs
    ? [STORES.HOUSEHOLDS, STORES.RESIDENTS, STORES.AUDIT_LOGS]
    : [STORES.HOUSEHOLDS, STORES.RESIDENTS];

  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, 'readwrite');
    const hhStore = tx.objectStore(STORES.HOUSEHOLDS);
    const resStore = tx.objectStore(STORES.RESIDENTS);

    hhStore.clear();
    resStore.clear();

    for (const h of households) {
      hhStore.put(h);
    }
    for (const r of residents) {
      resStore.put(r);
    }
    if (auditLogs) {
      const logStore = tx.objectStore(STORES.AUDIT_LOGS);
      logStore.clear();
      for (const l of auditLogs) {
        logStore.put(l);
      }
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPinConfig(): Promise<PinConfig | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SETTINGS, 'readonly');
    const req = tx.objectStore(STORES.SETTINGS).get('pin_config');
    req.onsuccess = () => {
      const record = req.result as { key: string; value: PinConfig } | undefined;
      resolve(record ? record.value : null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function savePinConfig(config: PinConfig): Promise<void> {
  await putInStore(STORES.SETTINGS, { key: 'pin_config', value: config });
}
