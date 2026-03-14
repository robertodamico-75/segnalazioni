import React from "react";
export function NcTimeline({ timeline }) {
  const rows = Array.isArray(timeline) ? timeline : [];

  return (
    <section className="detail-block">
      <h4>Storico azioni</h4>
      {!rows.length && <p className="muted">Nessun evento disponibile.</p>}
      <div className="timeline">
        {rows.map((item, idx) => (
          <div className="timeline-item" key={`${item.dataOra}-${idx}`}>
            <div className="timeline-point" />
            <div className="timeline-content">
              <div className="timeline-head">
                <strong>{item.azione}</strong>
                <span>{item.dataOra}</span>
              </div>
              <div className="timeline-meta">
                <span>Utente: {item.utente}</span>
                <span>
                  {item.statoPrecedente} ? {item.statoNuovo}
                </span>
              </div>
              {item.nota ? <p>{item.nota}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

