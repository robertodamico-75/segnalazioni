# NC Manager React Demo (ALPAC)

Mini web app React/Vite per demo gestione Non Conformita (NC) in contesto ALPAC (soluzioni per foro finestra).

## Avvio

1. `cd nc-manager-react`
2. `npm install`
3. `npm run dev`
4. apri `http://localhost:5173`

## Struttura

- `src/components/NcDashboard.jsx`
- `src/components/NcToolbar.jsx`
- `src/components/NcList.jsx`
- `src/components/NcCard.jsx`
- `src/components/NcDetail.jsx`
- `src/components/NcWorkflowActions.jsx`
- `src/components/NcTimeline.jsx`
- `src/components/NcFormModal.jsx`
- `src/components/NcToast.jsx`
- `src/services/ncArchiveService.js`
- `public/data/nc-archivio.json`

## Note persistenza

- Lettura iniziale da `public/data/nc-archivio.json`.
- Salvataggio demo su `localStorage`.
- Se disponibile File System Access API, e possibile collegare un file JSON reale e salvarlo direttamente.
- Polling automatico ogni 10 secondi per rilevare aggiornamenti del file archivio con toast notifica.
