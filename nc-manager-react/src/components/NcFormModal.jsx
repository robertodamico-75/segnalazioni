import React from "react";
import { PRIORITIES } from "../data/constants";

const INITIAL_FORM = {
  titolo: "",
  descrizione: "",
  categoria: "",
  gravita: "Bassa",
  reparto: "",
  luogo: "",
  operatore: "",
  dataNc: "",
  oraNc: "",
  riferimento: "",
  note: "",
  gpsCoord: "",
  osservazioniText: "",
  immaginiText: "",
  priorita: "media",
  severita: "media",
  segnalatoDa: "",
  assegnatoA: "",
  tipoNonConformita: "",
  prodotto: "",
  lotto: ""
};

export function NcFormModal({ open, onClose, onSubmit }) {
  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    payload.osservazioni = String(payload.osservazioniText || "")
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);
    payload.immagini = String(payload.immaginiText || "")
      .split(/\r?\n|,/)
      .map((x) => x.trim())
      .filter(Boolean);
    payload.segnalatoDa = payload.segnalatoDa || payload.operatore || "";
    payload.noteIniziali = payload.note || "";
    onSubmit(payload);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h3>Nuova Non Conformita</h3>
          <button className="btn btn-ghost" onClick={onClose}>×</button>
        </header>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="field-group field-grow">
            <label>Titolo *</label>
            <input name="titolo" defaultValue={INITIAL_FORM.titolo} required />
          </div>

          <div className="field-group field-grow">
            <label>Descrizione *</label>
            <textarea name="descrizione" defaultValue={INITIAL_FORM.descrizione} required />
          </div>

          <div className="field-grid two">
            <div className="field-group">
              <label>Famiglia prodotto ALPAC *</label>
              <select name="categoria" defaultValue={INITIAL_FORM.categoria} required>
                <option value="">Seleziona</option>
                <option value="Sistemi posa">Sistemi posa</option>
                <option value="Monoblocco">Monoblocco</option>
                <option value="Controtelaio">Controtelaio</option>
                <option value="Cassonetto">Cassonetto</option>
                <option value="Altro">Altro</option>
              </select>
            </div>
            <div className="field-group">
              <label>Gravita *</label>
              <select name="gravita" defaultValue={INITIAL_FORM.gravita} required>
                <option value="Bassa">Bassa</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Critica">Critica</option>
              </select>
            </div>
            <div className="field-group">
              <label>Cantiere / Cliente *</label>
              <input name="reparto" defaultValue={INITIAL_FORM.reparto} required />
            </div>
            <div className="field-group">
              <label>Posizione geografica (indirizzo)</label>
              <input name="luogo" defaultValue={INITIAL_FORM.luogo} />
            </div>
            <div className="field-group">
              <label>Operatore / Segnalatore *</label>
              <input name="operatore" defaultValue={INITIAL_FORM.operatore} required />
            </div>
            <div className="field-group">
              <label>Data *</label>
              <input name="dataNc" type="date" defaultValue={INITIAL_FORM.dataNc} required />
            </div>
            <div className="field-group">
              <label>Ora *</label>
              <input name="oraNc" type="time" defaultValue={INITIAL_FORM.oraNc} required />
            </div>
            <div className="field-group">
              <label>Numero ordine / commessa *</label>
              <input name="riferimento" defaultValue={INITIAL_FORM.riferimento} required />
            </div>
            <div className="field-group">
              <label>Coordinate GPS</label>
              <input name="gpsCoord" defaultValue={INITIAL_FORM.gpsCoord} />
            </div>
            <div className="field-group">
              <label>Tipo non conformita</label>
              <select name="tipoNonConformita" defaultValue={INITIAL_FORM.tipoNonConformita} required>
                <option value="">Seleziona tipo NC</option>
                <option value="Posa">Posa</option>
                <option value="Tenuta aria/acqua">Tenuta aria/acqua</option>
                <option value="Dimensionale">Dimensionale</option>
                <option value="Estetica">Estetica</option>
                <option value="Documentale">Documentale</option>
              </select>
            </div>
            <div className="field-group">
              <label>Prodotto *</label>
              <select name="prodotto" defaultValue={INITIAL_FORM.prodotto} required>
                <option value="">Seleziona prodotto ALPAC</option>
                <option value="Monoblocco Presystem">Monoblocco Presystem</option>
                <option value="Controtelaio Genius">Controtelaio Genius</option>
                <option value="Cassonetto ispezionabile">Cassonetto ispezionabile</option>
                <option value="Sistema posa RAL">Sistema posa RAL</option>
                <option value="Accessori sigillatura">Accessori sigillatura</option>
              </select>
            </div>

            <div className="field-group">
              <label>Lotto *</label>
              <input name="lotto" defaultValue={INITIAL_FORM.lotto} required />
            </div>
            <div className="field-group">
              <label>Assegnato a</label>
              <input name="assegnatoA" defaultValue={INITIAL_FORM.assegnatoA} />
            </div>
            <div className="field-group">
              <label>Priorita workflow</label>
              <select name="priorita" defaultValue={INITIAL_FORM.priorita}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>Severita workflow</label>
              <select name="severita" defaultValue={INITIAL_FORM.severita}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>Segnalato da</label>
              <input name="segnalatoDa" defaultValue={INITIAL_FORM.segnalatoDa} />
            </div>
          </div>

          <div className="field-group field-grow">
            <label>Note aggiuntive</label>
            <textarea name="note" defaultValue={INITIAL_FORM.note} />
          </div>

          <div className="field-group field-grow">
            <label>Osservazioni aggiuntive (una riga per voce)</label>
            <textarea name="osservazioniText" defaultValue={INITIAL_FORM.osservazioniText} />
          </div>

          <div className="field-group field-grow">
            <label>Immagini (URL/base64 separate da virgola o nuova riga)</label>
            <textarea name="immaginiText" defaultValue={INITIAL_FORM.immaginiText} />
          </div>

          <footer className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annulla</button>
            <button type="submit" className="btn btn-primary">Crea NC (bozza)</button>
          </footer>
        </form>
      </div>
    </div>
  );
}

