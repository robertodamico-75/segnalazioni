const ARCHIVE_PATH = `${import.meta.env.BASE_URL}data/nc-archivio.json`;
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

class NcArchiveService {
  constructor() {
    this.fileHandle = null;
    this.lastHash = "";
    this.pollTimer = null;
  }

  async fetchArchiveFromStatic() {
    const response = await fetch(`${ARCHIVE_PATH}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const text = await response.text();
    return parseArchive(text);
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
    if (local.length) {
      this.lastHash = this.getHash(local);
      return { items: local, source: "local" };
    }

    const remote = await this.fetchArchiveFromStatic();
    this.writeLocalArchive(remote);
    this.lastHash = this.getHash(remote);
    return { items: remote, source: "file" };
  }

  async reloadArchive() {
    const remote = await this.fetchArchiveFromStatic();
    this.writeLocalArchive(remote);
    this.lastHash = this.getHash(remote);
    return remote;
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
        const newHash = this.getHash(latest);
        if (newHash && newHash !== this.lastHash) {
          const prev = this.readLocalArchive();
          this.writeLocalArchive(latest);
          this.lastHash = newHash;
          if (onChanged) onChanged({ previous: prev, next: latest });
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

