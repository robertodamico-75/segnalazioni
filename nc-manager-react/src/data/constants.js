export const NC_STATUSES = ["bozza", "inviata", "in progress", "chiusa"];

export const STATUS_META = {
  bozza: { label: "Bozza", className: "status-bozza" },
  inviata: { label: "Inviata", className: "status-inviata" },
  "in progress": { label: "In Progress", className: "status-progress" },
  chiusa: { label: "Chiusa", className: "status-chiusa" }
};

export const PRIORITIES = ["bassa", "media", "alta", "critica"];

export const DETAIL_SECTIONS = [
  { key: "anagrafica", title: "Anagrafica NC" },
  { key: "segnalazione", title: "Segnalazione e Raccolta Dati" },
  { key: "qdaqswTrack", title: "QDA-QSW Track ALPAC" },
  { key: "workflow", title: "Workflow e Azioni" }
];

export const WORKFLOW_ACTIONS = {
  bozza: [
    "modifica",
    "salva bozza",
    "invia",
    "elimina"
  ],
  inviata: [
    "prendi in carico",
    "rimetti in bozza",
    "aggiungi nota",
    "allega file"
  ],
  "in progress": [
    "aggiorna analisi",
    "definisci azione correttiva",
    "assegna responsabile",
    "aggiorna scadenza",
    "aggiungi nota",
    "chiudi NC"
  ],
  chiusa: [
    "visualizza riepilogo",
    "riapri NC",
    "esporta riepilogo"
  ]
};

