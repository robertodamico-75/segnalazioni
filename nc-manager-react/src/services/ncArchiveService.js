const SHARED_ARCHIVE_ABS = "https://robertodamico-75.github.io/segnalazioni/nc-archivio.json";
const IS_LOCAL_DEV = typeof window !== "undefined" && /^(localhost|127\\.0\\.0\\.1)$/.test(window.location.hostname);
const ARCHIVE_PATH_CANDIDATES = IS_LOCAL_DEV
  ? [SHARED_ARCHIVE_ABS, "./nc-archivio.json", `${import.meta.env.BASE_URL}data/nc-archivio.json`]
  : ["/segnalazioni/nc-archivio.json", "../nc-archivio.json", SHARED_ARCHIVE_ABS, `${import.meta.env.BASE_URL}data/nc-archivio.json`];
const STORAGE_KEY = "qda_qsw_nc_archive_v1";

function stableStringify(value) {
  const seen = new WeakSet();
  return JSON.stringify(value, function replacer(key, val) {
    if (val && typeof val === "object") {
      if (seen.has(val)) return undefined;
      seen.add(val);
      if (Array.isArray(val)) return val;
      const sorted = {};
      Object.keys(val)
        .sort((a, b) => a.localeCompare(b))
        .forEach((k) => {
          sorted[k] = val[k];
        });
      return sorted;
    }
    return val;
  });
}

function parseArchive(raw) {
  if (!raw) return [];
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") {
    return Object.keys(parsed)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => parsed[key]);
  }
  return [];
}

function toObjectById(items) {
  const out = {};
  (items || []).forEach((item) => {
    if (!item?.id) return;
    out[String(item.id)] = item;
  });
  return out;
}

function mergeArchives(remoteItems, localItems) {
  const mergedById = toObjectById(remoteItems || []);
  (localItems || []).forEach((item) => {
    if (!item?.id) return;
    mergedById[String(item.id)] = item;
  });
  return Object.keys(mergedById)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => mergedById[key]);
}

class NcArchiveService {
  constructor() {
    this.fileHandle = null;
    this.lastHash = "";
    this.pollTimer = null;
  }

  async fetchArchiveFromStatic() {
    const suffix = `?t=${Date.now()}`;
    let lastError = null;

    for (const archivePath of ARCHIVE_PATH_CANDIDATES) {
      try {
        const response = await fetch(`${archivePath}${suffix}`, { cache: "no-store" });
        if (!response.ok) {
          lastError = new Error(`HTTP ${response.status} on ${archivePath}`);
          continue;
        }
        const text = await response.text();
        return parseArchive(text);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error(`Archivio JSON non trovato. Tentati: ${ARCHIVE_PATH_CANDIDATES.join(", ")}`);
  }

  readLocalArchive() {
    try {
      return parseArchive(localStorage.getItem(STORAGE_KEY));
    } catch {
      return [];
    }
  }

  writeLocalArchive(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items, null, 2));
  }

  getHash(items) {
    return stableStringify(toObjectById(items));
  }

  async loadArchive() {
    const local = this.readLocalArchive();

    try {
      const remote = await this.fetchArchiveFromStatic();
      const merged = mergeArchives(remote, local);
      this.writeLocalArchive(merged);
      this.lastHash = this.getHash(merged);
      return { items: merged, source: local.length ? "merged" : "file" };
    } catch {
      if (local.length) {
        this.lastHash = this.getHash(local);
        return { items: local, source: "local" };
      }
      throw new Error("Archivio non disponibile");
    }
  }

  async reloadArchive() {
    const remote = await this.fetchArchiveFromStatic();
    const local = this.readLocalArchive();
    const merged = mergeArchives(remote, local);
    this.writeLocalArchive(merged);
    this.lastHash = this.getHash(merged);
    return merged;
  }

  async saveArchive(items) {
    this.writeLocalArchive(items);
    this.lastHash = this.getHash(items);

    if (this.fileHandle && window.showSaveFilePicker) {
      const writable = await this.fileHandle.createWritable();
      await writable.write(JSON.stringify(toObjectById(items), null, 2));
      await writable.close();
      return { persistedToFile: true };
    }

    return { persistedToFile: false };
  }

  async connectFileHandle() {
    if (!window.showOpenFilePicker) {
      throw new Error("File picker non supportato");
    }
    const [handle] = await window.showOpenFilePicker({
      multiple: false,
      types: [{ description: "JSON", accept: { "application/json": [".json"] } }]
    });
    if (!handle) {
      throw new Error("Nessun file selezionato");
    }
    this.fileHandle = handle;
    const file = await handle.getFile();
    const text = await file.text();
    const items = parseArchive(text);
    this.writeLocalArchive(items);
    this.lastHash = this.getHash(items);
    return items;
  }

  startPolling({ intervalMs = 10000, onChanged, onError } = {}) {
    this.stopPolling();
    this.pollTimer = window.setInterval(async () => {
      try {
        const latest = await this.fetchArchiveFromStatic();
        const prev = this.readLocalArchive();
        const merged = mergeArchives(latest, prev);
        const newHash = this.getHash(merged);
        if (newHash && newHash !== this.lastHash) {
          this.writeLocalArchive(merged);
          this.lastHash = newHash;
          if (onChanged) onChanged({ previous: prev, next: merged });
        }
      } catch (error) {
        if (onError) onError(error);
      }
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollTimer) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
}

export const ncArchiveService = new NcArchiveService();
export { parseArchive, toObjectById };

