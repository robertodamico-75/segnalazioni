import { STATUS_META } from "../data/constants";
import { NcWorkflowActions } from "./NcWorkflowActions";
import { NcTimeline } from "./NcTimeline";

function Row({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || "-"}</span>
    </div>
  );
}

export function NcDetail({ nc, onWorkflowAction }) {
  if (!nc) {
    return (
      <section className="detail-panel empty-detail">
        <h3>Seleziona una NC</h3>
        <p>Apri una non conformita dalla lista per vedere dettaglio, workflow e storico.</p>
      </section>
    );
  }

  const statusMeta = STATUS_META[nc.stato] || STATUS_META.bozza;
  const seg = nc.segnalazione || {};
  const qsw = nc.qdaqswTrack || {};

  return (
    <section className="detail-panel">
      <header className="detail-header">
        <div>
          <h2>{nc.codiceNC}</h2>
          <p>{nc.titolo}</p>
        </div>
        <span className={`status-badge ${statusMeta.className}`}>{statusMeta.label}</span>
      </header>

      <details className="detail-block" open>
        <summary>Anagrafica NC</summary>
        <div className="detail-grid two">
          <Row label="ID" value={nc.id} />
          <Row label="Codice NC" value={nc.codiceNC} />
          <Row label="Titolo" value={nc.titolo} />
          <Row label="Descrizione" value={nc.descrizione} />
          <Row label="Stato" value={nc.stato} />
          <Row label="Priorita" value={nc.priorita} />
          <Row label="Severita" value={nc.severita} />
          <Row label="Origine" value={nc.origine} />
          <Row label="Reparto" value={nc.reparto} />
          <Row label="Linea" value={nc.linea} />
          <Row label="Prodotto" value={nc.prodotto} />
          <Row label="Lotto" value={nc.lotto} />
          <Row label="Commessa" value={nc.commessa} />
          <Row label="Ordine Produzione" value={nc.ordineProduzione} />
          <Row label="Fornitore" value={nc.fornitore} />
          <Row label="Cliente" value={nc.cliente} />
          <Row label="Data creazione" value={nc.dataCreazione} />
          <Row label="Creato da" value={nc.creatoDa} />
          <Row label="Data ultimo aggiornamento" value={nc.dataUltimoAggiornamento} />
          <Row label="Assegnato a" value={nc.assegnatoA} />
        </div>
      </details>

      <details className="detail-block" open>
        <summary>Segnalazione / Raccolta dati</summary>
        <div className="detail-grid two">
          <Row label="Data segnalazione" value={seg.dataSegnalazione} />
          <Row label="Segnalato da" value={seg.segnalatoDa} />
          <Row label="Luogo rilevazione" value={seg.luogoRilevazione} />
          <Row label="Tipo non conformita" value={seg.tipoNonConformita} />
          <Row label="Categoria" value={seg.categoria} />
          <Row label="Descrizione dettagliata" value={seg.descrizioneDettagliata} />
          <Row label="Quantita coinvolta" value={seg.quantitaCoinvolta} />
          <Row label="Unita misura" value={seg.unitaMisura} />
          <Row label="Riferimento documento" value={seg.riferimentoDocumento} />
          <Row label="Allegati" value={(seg.allegati || []).join(", ")} />
          <Row label="Immagini" value={(seg.immagini || []).join(", ")} />
          <Row label="Note operatore" value={seg.noteOperatore} />
        </div>
      </details>

      <details className="detail-block" open>
        <summary>QDA-QSW Track ALPAC</summary>
        <div className="detail-grid two">
          <Row label="Codice tracciamento" value={qsw.codiceTracciamento} />
          <Row label="Tipo evento" value={qsw.tipoEvento} />
          <Row label="Fase processo" value={qsw.faseProcesso} />
          <Row label="Postazione" value={qsw.postazione} />
          <Row label="Caratteristica controllata" value={qsw.caratteristicaControllata} />
          <Row label="Esito controllo" value={qsw.esitoControllo} />
          <Row label="Valore rilevato" value={qsw.valoreRilevato} />
          <Row label="Limite min" value={qsw.limiteMin} />
          <Row label="Limite max" value={qsw.limiteMax} />
          <Row label="Strumento misura" value={qsw.strumentoMisura} />
          <Row label="Operatore" value={qsw.operatore} />
          <Row label="Macchina" value={qsw.macchina} />
          <Row label="Turno" value={qsw.turno} />
          <Row label="Data/ora evento" value={qsw.dataOraEvento} />
          <Row label="Note tecniche" value={qsw.noteTecniche} />
          <Row label="Rif. controllo collegato" value={qsw.riferimentoControlloCollegato} />
          <Row label="Rif. audit/checklist" value={qsw.riferimentoAuditChecklist} />
          <Row label="ID esterno" value={qsw.idEsterno} />
        </div>
      </details>

      <NcWorkflowActions nc={nc} onAction={onWorkflowAction} />
      <NcTimeline timeline={nc.timeline} />
    </section>
  );
}

