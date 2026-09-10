interface PaginationProps {
  currentPage: number; // 0-indexed (0 es la primera página)
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (newPage: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  totalElements,
  size,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const startElement = currentPage * size + 1;
  const endElement = Math.min((currentPage + 1) * size, totalElements);

  // Función para calcular las páginas a mostrar con elipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5; // Número máximo de páginas a mostrar sin contar elipsis

    if (totalPages <= maxVisiblePages + 2) {
      // Si hay pocas páginas, las mostramos todas
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    // Siempre incluimos la primera página
    pages.push(0);

    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages - 2, currentPage + 1);

    // Elipsis izquierda
    if (startPage > 1) {
      pages.push("...");
    }

    // Páginas intermedias alrededor de la actual
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Elipsis derecha
    if (endPage < totalPages - 2) {
      pages.push("...");
    }

    // Siempre incluimos la última página
    pages.push(totalPages - 1);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-3">
      {/* Texto informativo */}
      <span className="text-muted small">
        Showing <strong>{startElement}</strong> to <strong>{endElement}</strong>{" "}
        of <strong>{totalElements}</strong> entries
      </span>

      {/* Control de botones */}
      <ul className="pagination pagination-sm mb-0">
        {/* Botón Previous */}
        <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </button>
        </li>

        {/* Genera botones numéricos y elipsis */}
        {pageNumbers.map((page, index) => {
          if (typeof page === "string") {
            return (
              <li key={`ellipsis-${index}`} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            );
          }

          return (
            <li
              key={page}
              className={`page-item ${currentPage === page ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => onPageChange(page)}>
                {page + 1}
              </button>
            </li>
          );
        })}

        {/* Botón Next */}
        <li
          className={`page-item ${
            currentPage >= totalPages - 1 ? "disabled" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </button>
        </li>
      </ul>
    </div>
  );
};
