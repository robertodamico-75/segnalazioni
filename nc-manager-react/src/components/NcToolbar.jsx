import React from "react";
import { NC_STATUSES } from "../data/constants";

export function NcToolbar({
  filters,
  onFilterChange,
  onCreate,
  onReload,
  onSortChange,
  onConfigureGitHub,
  onPublishGitHub
}) {
  return (
    <section className="toolbar-card">
      <div className="toolbar-row">
        <div className="field-group">
          <label>Stato</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          >
            <option value="all">Tutti</option>
            {NC_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group field-grow">
          <label>Ricerca</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Titolo, codice NC, descrizione, reparto, responsabile"
          />
        </div>

        <div className="field-group">
          <label>Ordina</label>
          <select value={filters.sortBy} onChange={(e) => onSortChange(e.target.value)}>
            <option value="created">Data creazione</option>
            <option value="updated">Ultimo aggiornamento</option>
          </select>
        </div>
      </div>

      <div className="toolbar-actions">
        <button className="btn btn-primary" onClick={onCreate}>
          Nuova NC
        </button>
        <button className="btn btn-secondary" onClick={onReload}>
          Ricarica archivio
        </button>
        <button className="btn btn-secondary" onClick={onConfigureGitHub}>
          Token Ambiente Demo ASI
        </button>
        <button className="btn btn-primary" onClick={onPublishGitHub}>
          Pubblica Ambiente Demo ASI
        </button>
      </div>
    </section>
  );
}

