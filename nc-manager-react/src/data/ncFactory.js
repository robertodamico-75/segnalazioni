import { WORKFLOW_ACTIONS } from "./constants";

function formatDateTime(date = new Date()) {
  const pad = (v) => String(v).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export function generateNcCode(id) {
  return `NC-${String(id).padStart(5, "0")}`;
}

export function createNcFromForm(form, nextId) {
  const now = new Date();
  const nowDateTime = formatDateTime(now);
  return {
    id: nextId,
    codiceNC: generateNcCode(nextId),
    titolo: form.titolo,
    descrizione: form.descrizione,
    stato: "bozza",
    priorita: form.priorita,
    severita: form.severita,
    origine: "campo",
    reparto: form.reparto,
    linea: "",
    prodotto: form.prodotto,
    lotto: form.lotto,
    commessa: "",
    ordineProduzione: "",
    fornitore: "",
    cliente: "",
    dataCreazione: nowDateTime,
    creatoDa: form.segnalatoDa,
    dataUltimoAggiornamento: nowDateTime,
    assegnatoA: form.assegnatoA,
    segnalazione: {
      dataSegnalazione: nowDateTime,
      segnalatoDa: form.segnalatoDa,
      luogoRilevazione: "",
      tipoNonConformita: form.tipoNonConformita,
      categoria: form.categoria,
      descrizioneDettagliata: form.descrizione,
      quantitaCoinvolta: "",
      unitaMisura: "",
      riferimentoDocumento: "",
      allegati: [],
      immagini: [],
      noteOperatore: form.noteIniziali
    },
    qdaqswTrack: {
      codiceTracciamento: `QSW-${String(nextId).padStart(6, "0")}`,
      tipoEvento: "Segnalazione NC",
      faseProcesso: "Produzione",
      postazione: "",
      caratteristicaControllata: "",
      esitoControllo: "KO",
      valoreRilevato: "",
      limiteMin: "",
      limiteMax: "",
      strumentoMisura: "",
      operatore: form.segnalatoDa,
      macchina: "",
      turno: "",
      dataOraEvento: nowDateTime,
      noteTecniche: form.noteIniziali,
      riferimentoControlloCollegato: "",
      riferimentoAuditChecklist: "",
      idEsterno: ""
    },
    workflow: {
      analisi: "",
      azioneCorrettiva: "",
      scadenza: "",
      allegatiWorkflow: []
    },
    timeline: [
      {
        dataOra: nowDateTime,
        utente: form.segnalatoDa || "Sistema",
        azione: "creazione",
        statoPrecedente: "-",
        statoNuovo: "bozza",
        nota: form.noteIniziali || "NC creata"
      }
    ]
  };
}

export function getAllowedActions(status) {
  return WORKFLOW_ACTIONS[status] || [];
}

function addTimeline(nc, { user, action, previous, next, note }) {
  nc.timeline = Array.isArray(nc.timeline) ? nc.timeline : [];
  nc.timeline.unshift({
    dataOra: formatDateTime(new Date()),
    utente: user || "Operatore",
    azione: action,
    statoPrecedente: previous,
    statoNuovo: next,
    nota: note || ""
  });
}

export function applyWorkflowAction(nc, action, payload = {}) {
  const clone = JSON.parse(JSON.stringify(nc));
  const previous = clone.stato;
  let next = clone.stato;

  switch (action) {
    case "invia":
      next = "inviata";
      break;
    case "prendi in carico":
      next = "in progress";
      break;
    case "rimetti in bozza":
      next = "bozza";
      break;
    case "chiudi NC":
      next = "chiusa";
      break;
    case "riapri NC":
      next = "in progress";
      break;
    case "assegna responsabile":
      clone.assegnatoA = payload.assignedTo || clone.assegnatoA;
      break;
    case "aggiorna analisi":
      clone.workflow.analisi = payload.text || clone.workflow.analisi;
      break;
    case "definisci azione correttiva":
      clone.workflow.azioneCorrettiva = payload.text || clone.workflow.azioneCorrettiva;
      break;
    case "aggiorna scadenza":
      clone.workflow.scadenza = payload.date || clone.workflow.scadenza;
      break;
    default:
      break;
  }

  if (action === "elimina") {
    return { remove: true, item: clone };
  }

  clone.stato = next;
  clone.dataUltimoAggiornamento = formatDateTime(new Date());
  addTimeline(clone, {
    user: payload.user,
    action,
    previous,
    next,
    note: payload.note
  });

  return { remove: false, item: clone };
}

export function computeChanges(previousItems, nextItems) {
  const prevById = new Map((previousItems || []).map((x) => [x.id, x]));
  const nextById = new Map((nextItems || []).map((x) => [x.id, x]));
  const changed = [];

  for (const [id, next] of nextById) {
    const prev = prevById.get(id);
    if (!prev) {
      changed.push({ id, type: "new" });
      continue;
    }
    if (JSON.stringify(prev) !== JSON.stringify(next)) {
      changed.push({ id, type: "updated" });
    }
  }

  return changed;
}

