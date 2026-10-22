export default function Pager({ pagination, onChange }) {
  const { page, totalPages } = pagination;
  return (
    <div className="row">
      <button className="btn light small" disabled={page <= 1} onClick={() => onChange(page - 1)}>◀</button>
      <span>Page {page} / {totalPages || 1}</span>
      <button className="btn light small" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>▶</button>
    </div>
  );
}
