import { PRIORITIES } from "../data/constants";

const INITIAL_FORM = {
  titolo: "",
  descrizione: "",
  reparto: "",
  priorita: "media",
  severita: "media",
  segnalatoDa: "",
  assegnatoA: "",
  categoria: "",
  tipoNonConformita: "",
  prodotto: "",
  lotto: "",
  noteIniziali: ""
};

export function NcFormModal({ open, onClose, onSubmit }) {
  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
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
              <label>Reparto *</label>
              <input name="reparto" defaultValue={INITIAL_FORM.reparto} required />
            </div>
            <div className="field-group">
              <label>Priorita *</label>
              <select name="priorita" defaultValue={INITIAL_FORM.priorita}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Severita *</label>
              <select name="severita" defaultValue={INITIAL_FORM.severita}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>Segnalato da *</label>
              <input name="segnalatoDa" defaultValue={INITIAL_FORM.segnalatoDa} required />
            </div>

            <div className="field-group">
              <label>Assegnato a *</label>
              <input name="assegnatoA" defaultValue={INITIAL_FORM.assegnatoA} required />
            </div>
            <div className="field-group">
              <label>Categoria *</label>
              <select name="categoria" defaultValue={INITIAL_FORM.categoria} required>
                <option value="">Seleziona categoria</option>
                <option value="Sistemi posa">Sistemi posa</option>
                <option value="Monoblocco">Monoblocco</option>
                <option value="Controtelaio">Controtelaio</option>
                <option value="Cassonetto">Cassonetto</option>
                <option value="Accessori foro finestra">Accessori foro finestra</option>
              </select>
            </div>

            <div className="field-group">
              <label>Tipo non conformita *</label>
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
          </div>

          <div className="field-group field-grow">
            <label>Note iniziali</label>
            <textarea name="noteIniziali" defaultValue={INITIAL_FORM.noteIniziali} />
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

