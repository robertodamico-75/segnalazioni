import { getAllowedActions } from "../data/ncFactory";

export function NcWorkflowActions({ nc, onAction }) {
  const actions = getAllowedActions(nc?.stato);

  if (!nc) return null;

  return (
    <section className="detail-block">
      <h4>Workflow azioni</h4>
      <div className="workflow-grid">
        {actions.map((action) => (
          <button
            key={action}
            className="btn btn-workflow"
            onClick={() => onAction(action)}
          >
            {action}
          </button>
        ))}
      </div>
    </section>
  );
}

