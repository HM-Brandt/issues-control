export const TableSkeleton = ({
  rows = 5,
  columns = 7,
}: {
  rows?: number;
  columns?: number;
}) => {
  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead className="table-light">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i}>
                <div className="placeholder-glow">
                  {/* Agregamos py-2 y d-inline-block para forzar altura */}
                  <span className="placeholder col-8 bg-secondary py-2 d-inline-block"></span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  <div className="placeholder-glow">
                    {/* py-2 le da el grosor visible al rectángulo */}
                    <span className="placeholder col-10 bg-secondary py-2 d-inline-block"></span>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
