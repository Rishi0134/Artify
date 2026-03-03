import "./Pagination.css";

const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.pages <= 1) return null;

  const pages = Array.from({ length: meta.pages }, (_, index) => index + 1);

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        disabled={meta.page <= 1}
        onClick={() => onPageChange(meta.page - 1)}
      >
        Prev
      </button>

      {pages.map((page) => (
        <button
          key={page}
          className={`pagination-btn ${meta.page === page ? "active" : ""}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        className="pagination-btn"
        disabled={meta.page >= meta.pages}
        onClick={() => onPageChange(meta.page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
