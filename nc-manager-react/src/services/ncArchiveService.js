const SHARED_ARCHIVE_ABS = "https://robertodamico-75.github.io/segnalazioni/nc-archivio.json";
const ARCHIVE_PATH_CANDIDATES = [SHARED_ARCHIVE_ABS];
const STORAGE_KEY = "qda_qsw_nc_archive_v1";
const GITHUB_TOKEN_KEY = "qda_qsw_github_token_v1";
const GITHUB_OWNER = "robertodamico-75";
const GITHUB_REPO = "segnalazioni";
const GITHUB_BRANCH = "main";
const GITHUB_FILE_PATH = "nc-archivio.json";
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

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

function base64Utf8(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

class NcArchiveService {
  constructor() {
    this.fileHandle = null;
    this.lastHash = "";
    this.pollTimer = null;
    this.lastLoadedUrl = "";
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
        this.lastLoadedUrl = archivePath;
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
    try {
      const remote = await this.fetchArchiveFromStatic();
      this.writeLocalArchive(remote);
      this.lastHash = this.getHash(remote);
      return { items: remote, source: "file" };
    } catch {
      throw new Error("Archivio non disponibile");
    }
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
    let persistedToGitHub = false;
    let githubError = "";

    if (this.fileHandle && window.showSaveFilePicker) {
      const writable = await this.fileHandle.createWritable();
      await writable.write(JSON.stringify(toObjectById(items), null, 2));
      await writable.close();
      return { persistedToFile: true, persistedToGitHub, githubError };
    }

    const token = this.getGitHubToken();
    if (token) {
      try {
        await this.publishToGitHub(items, token);
        persistedToGitHub = true;
      } catch (error) {
        githubError = error?.message || "Pubblicazione GitHub non riuscita";
      }
    }

    return { persistedToFile: false, persistedToGitHub, githubError };
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
        const newHash = this.getHash(latest);
        if (newHash && newHash !== this.lastHash) {
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

  getGitHubToken() {
    try {
      return (localStorage.getItem(GITHUB_TOKEN_KEY) || "").trim();
    } catch {
      return "";
    }
  }

  setGitHubToken(token) {
    const value = String(token || "").trim();
    if (!value) {
      localStorage.removeItem(GITHUB_TOKEN_KEY);
      return;
    }
    localStorage.setItem(GITHUB_TOKEN_KEY, value);
  }

  async publishToGitHub(items, token = this.getGitHubToken()) {
    if (!token) throw new Error("Token GitHub mancante");

    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28"
    };

    let sha;
    const getResp = await fetch(`${GITHUB_API_URL}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, { headers });
    if (getResp.ok) {
      const current = await getResp.json();
      sha = current?.sha;
    } else if (getResp.status !== 404) {
      throw new Error(`Lettura GitHub fallita (HTTP ${getResp.status})`);
    }

    const body = {
      message: "Aggiornamento nc-archivio da nc-manager-react",
      content: base64Utf8(JSON.stringify(toObjectById(items), null, 2)),
      branch: GITHUB_BRANCH
    };
    if (sha) body.sha = sha;

    const putResp = await fetch(GITHUB_API_URL, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!putResp.ok) {
      const details = await putResp.text();
      throw new Error(`Scrittura GitHub fallita (HTTP ${putResp.status}): ${details.slice(0, 160)}`);
    }
  }
}

export const ncArchiveService = new NcArchiveService();
export { parseArchive, toObjectById };

