import React from "react";
import { STATUS_META } from "../data/constants";

export function NcCard({ nc, selected, onOpen, highlightType }) {
  const meta = STATUS_META[nc.stato] || STATUS_META.bozza;

  return (
    <article className={`nc-card ${selected ? "selected" : ""} ${highlightType ? `highlight-${highlightType}` : ""}`}>
      <div className="nc-card-head">
        <h3>{nc.codiceNC}</h3>
        <span className={`status-badge ${meta.className}`}>{meta.label}</span>
      </div>

      <p className="nc-title">{nc.titolo}</p>
      <p className="nc-desc">{nc.descrizione}</p>

      <div className="nc-meta-grid">
        <span><strong>Priorita:</strong> {nc.priorita}</span>
        <span><strong>Severita:</strong> {nc.severita}</span>
        <span><strong>Reparto:</strong> {nc.reparto || "-"}</span>
        <span><strong>Responsabile:</strong> {nc.assegnatoA || "-"}</span>
        <span><strong>Creata:</strong> {nc.dataCreazione}</span>
        <span><strong>Aggiornata:</strong> {nc.dataUltimoAggiornamento}</span>
      </div>

      <div className="nc-card-actions">
        <button className="btn btn-outline" onClick={() => onOpen(nc.id)}>
          Apri dettaglio
        </button>
      </div>
    </article>
  );
}

