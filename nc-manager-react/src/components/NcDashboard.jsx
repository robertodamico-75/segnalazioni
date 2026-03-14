import React from "react";
import { useEffect, useMemo, useState } from "react";
import { NcToolbar } from "./NcToolbar";
import { NcList } from "./NcList";
import { NcDetail } from "./NcDetail";
import { NcFormModal } from "./NcFormModal";
import { NcToast } from "./NcToast";
import { ncArchiveService } from "../services/ncArchiveService";
import { applyWorkflowAction, computeChanges, createNcFromForm } from "../data/ncFactory";

function parseDateSafe(value) {
  if (!value) return 0;
  const normalized = value.replace(" ", "T");
  const epoch = Date.parse(normalized);
  return Number.isNaN(epoch) ? 0 : epoch;
}

export function NcDashboard() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ status: "all", search: "", sortBy: "updated" });
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [lastUpdatedAt, setLastUpdatedAt] = useState("");
  const [highlights, setHighlights] = useState({});
  const [dataSource, setDataSource] = useState("-");
  const [githubSyncAt, setGithubSyncAt] = useState("-");

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        const { items: loaded } = await ncArchiveService.loadArchive();
        if (!mounted) return;
        setItems(loaded);
        setSelectedId(loaded[0]?.id ?? null);
        setLastUpdatedAt(new Date().toLocaleString("it-IT"));
        setDataSource(ncArchiveService.lastLoadedUrl || "-");
        setToast({ type: "success", message: `Caricate ${loaded.length} NC da ${ncArchiveService.lastLoadedUrl || "sorgente sconosciuta"}` });
      } catch (error) {
        if (!mounted) return;
        setToast({ type: "error", message: `Errore nel caricamento archivio NC: ${error?.message || "sorgente non raggiungibile"}` });
      }
    };

    boot();

    ncArchiveService.startPolling({
      intervalMs: 10000,
      onChanged: ({ previous, next }) => {
        const changed = computeChanges(previous, next);
        const marker = {};
        changed.forEach((entry) => {
          marker[entry.id] = entry.type;
        });
        setHighlights(marker);
        setItems(next);
        setLastUpdatedAt(new Date().toLocaleString("it-IT"));
        setDataSource(ncArchiveService.lastLoadedUrl || "-");
        setToast({ type: "success", message: "Archivio NC aggiornato: caricati nuovi dati." });

        if (!next.some((x) => x.id === selectedId)) {
          setSelectedId(next[0]?.id ?? null);
        }

        window.setTimeout(() => setHighlights({}), 5000);
      },
      onError: () => {
        setToast({ type: "warning", message: "Controllo aggiornamenti non disponibile al momento." });
      }
    });

    return () => {
      mounted = false;
      ncArchiveService.stopPolling();
    };
  }, []);

  useEffect(() => {
    if (!toast.message) return undefined;
    const t = window.setTimeout(() => setToast({ type: "", message: "" }), 3600);
    return () => window.clearTimeout(t);
  }, [toast.message]);

  const filteredItems = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    const result = items.filter((item) => {
      if (filters.status !== "all" && item.stato !== filters.status) {
        return false;
      }

      if (!query) return true;

      const haystack = [
        item.titolo,
        item.codiceNC,
        item.descrizione,
        item.reparto,
        item.assegnatoA,
        item.creatoDa
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });

    result.sort((a, b) => {
      const aDate = filters.sortBy === "created" ? parseDateSafe(a.dataCreazione) : parseDateSafe(a.dataUltimoAggiornamento);
      const bDate = filters.sortBy === "created" ? parseDateSafe(b.dataCreazione) : parseDateSafe(b.dataUltimoAggiornamento);
      return bDate - aDate;
    });

    return result;
  }, [items, filters]);

  const selectedNc = useMemo(() => {
    if (!selectedId) return null;
    return items.find((item) => item.id === selectedId) || null;
  }, [items, selectedId]);

  const stats = useMemo(() => {
    const total = items.length;
    const aperte = items.filter((x) => x.stato !== "chiusa").length;
    return { total, aperte };
  }, [items]);

  const persist = async (nextItems, successMessage) => {
    setItems(nextItems);
    const selectedStillExists = nextItems.some((x) => x.id === selectedId);
    if (!selectedStillExists) {
      setSelectedId(nextItems[0]?.id ?? null);
    }

    try {
      const result = await ncArchiveService.saveArchive(nextItems);
      const suffix = result.persistedToFile ? " (file collegato aggiornato)" : "";
      const gh = result.persistedToGitHub ? " (GitHub aggiornato)" : "";
      if (result.persistedToGitHub) {
        setGithubSyncAt(new Date().toLocaleString("it-IT"));
      }
      if (result.githubError) {
        setToast({ type: "warning", message: `${successMessage}${suffix}. GitHub non aggiornato: ${result.githubError}` });
      } else {
        setToast({ type: "success", message: `${successMessage}${suffix}${gh}` });
      }
      setLastUpdatedAt(new Date().toLocaleString("it-IT"));
    } catch {
      setToast({ type: "error", message: "Salvataggio archivio non riuscito." });
    }
  };

  const handleReload = async () => {
    try {
      const next = await ncArchiveService.reloadArchive();
      setItems(next);
      setSelectedId(next[0]?.id ?? null);
      setLastUpdatedAt(new Date().toLocaleString("it-IT"));
      setDataSource(ncArchiveService.lastLoadedUrl || "-");
      setToast({ type: "success", message: `Archivio ricaricato: ${next.length} NC da ${ncArchiveService.lastLoadedUrl || "sorgente sconosciuta"}.` });
    } catch (error) {
      setToast({ type: "error", message: `Impossibile ricaricare archivio: ${error?.message || "sorgente non raggiungibile"}` });
    }
  };

  const handleCreate = async (payload) => {
    const nextId = (items.reduce((max, item) => Math.max(max, item.id), 0) || 0) + 1;
    const nc = createNcFromForm(payload, nextId);
    const next = [nc, ...items];
    setShowForm(false);
    setSelectedId(nc.id);
    await persist(next, "Nuova NC creata in bozza.");
  };

  const handleConfigureGitHub = () => {
    const current = ncArchiveService.getGitHubToken();
    const value = window.prompt("Inserisci token GitHub (repo contents write). Vuoto = rimuovi.", current);
    if (value == null) return;
    ncArchiveService.setGitHubToken(value);
    if (!String(value).trim()) {
      setToast({ type: "warning", message: "Token GitHub rimosso." });
      return;
    }
    setToast({ type: "success", message: "Token GitHub salvato su questo dispositivo." });
  };

  const handlePublishGitHub = async () => {
    try {
      await ncArchiveService.publishToGitHub(items);
      const when = new Date().toLocaleString("it-IT");
      setGithubSyncAt(when);
      setToast({ type: "success", message: "Archivio pubblicato su GitHub." });
    } catch (error) {
      setToast({ type: "error", message: `Pubblicazione GitHub fallita: ${error?.message || "errore sconosciuto"}` });
    }
  };

  const handleWorkflowAction = async (action) => {
    if (!selectedNc) return;

    const payload = { user: "Utente Demo" };

    if (action === "aggiungi nota" || action === "aggiorna analisi" || action === "definisci azione correttiva") {
      const note = window.prompt("Inserisci nota:", "");
      if (note == null) return;
      payload.note = note;
      payload.text = note;
    }

    if (action === "assegna responsabile") {
      const assignedTo = window.prompt("Nuovo responsabile:", selectedNc.assegnatoA || "");
      if (assignedTo == null) return;
      payload.assignedTo = assignedTo;
      payload.note = `Assegnato a ${assignedTo}`;
    }

    if (action === "aggiorna scadenza") {
      const date = window.prompt("Nuova scadenza (YYYY-MM-DD):", selectedNc.workflow?.scadenza || "");
      if (date == null) return;
      payload.date = date;
      payload.note = `Scadenza aggiornata a ${date}`;
    }

    if (action === "allega file") {
      payload.note = "Allegato file registrato (demo).";
    }

    if (action === "visualizza riepilogo" || action === "esporta riepilogo") {
      payload.note = "Riepilogo visualizzato/esportato (demo).";
    }

    const result = applyWorkflowAction(selectedNc, action, payload);

    if (result.remove) {
      const next = items.filter((x) => x.id !== selectedNc.id);
      await persist(next, "NC eliminata.");
      return;
    }

    const next = items.map((x) => (x.id === result.item.id ? result.item : x));
    await persist(next, `Azione '${action}' applicata.`);
  };

  return (
    <div className="dashboard-shell">
      <header className="app-header">
        <div>
          <h1>QDA-QSW Track - Gestore Non Conformita ALPAC</h1>
          <p>Monitoraggio, gestione e avanzamento NC su soluzioni per il foro finestra</p>
        </div>
        <div className="header-badges">
          <span className="metric-badge">Totali: {stats.total}</span>
          <span className="metric-badge metric-open">Aperte: {stats.aperte}</span>
          <span className="metric-badge">Contesto: ALPAC ITALIA</span>
          <span className="metric-badge">Sorgente: {dataSource}</span>
          <span className="metric-badge">Sync GitHub: {githubSyncAt}</span>
          <span className="metric-badge metric-updated">Ultimo aggiornamento: {lastUpdatedAt || "-"}</span>
        </div>
      </header>

      <NcToolbar
        filters={filters}
        onFilterChange={setFilters}
        onCreate={() => setShowForm(true)}
        onReload={handleReload}
        onSortChange={(sortBy) => setFilters((prev) => ({ ...prev, sortBy }))}
        onConfigureGitHub={handleConfigureGitHub}
        onPublishGitHub={handlePublishGitHub}
      />

      <main className="dashboard-main">
        <section className="left-column">
          <NcList
            items={filteredItems}
            selectedId={selectedId}
            onSelect={setSelectedId}
            highlights={highlights}
          />
        </section>

        <section className="right-column">
          <NcDetail nc={selectedNc} onWorkflowAction={handleWorkflowAction} />
        </section>
      </main>

      <NcFormModal open={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreate} />
      <NcToast toast={toast} onClose={() => setToast({ type: "", message: "" })} />
    </div>
  );
}

