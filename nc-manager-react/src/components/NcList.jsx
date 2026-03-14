import { NcCard } from "./NcCard";

export function NcList({ items, selectedId, onSelect, highlights }) {
  if (!items.length) {
    return (
      <div className="empty-state">
        <h3>Nessuna NC trovata</h3>
        <p>Prova a cambiare filtro oppure crea una nuova non conformita.</p>
      </div>
    );
  }

  return (
    <div className="nc-list">
      {items.map((nc) => (
        <NcCard
          key={nc.id}
          nc={nc}
          selected={selectedId === nc.id}
          onOpen={onSelect}
          highlightType={highlights[nc.id]}
        />
      ))}
    </div>
  );
}

