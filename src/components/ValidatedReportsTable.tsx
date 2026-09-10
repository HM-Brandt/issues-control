import type { Issue } from "../types";
import { formatToUSDate } from "../utils/dateFormat";
import { TableSkeleton } from "./TableSkeleton";

type Props = {
  reports?: Issue[];
  getPriorityBadge: any;
  isLoading: boolean;
  isError: boolean;
};

function ValidatedReportsTable({
  reports,
  getPriorityBadge,
  isLoading,
  isError,
}: Props) {
  const getFlowBadge = (flow: any) => {
    const normalized = flow?.toUpperCase();
    switch (normalized) {
      case "PENDING":
        return <span className="badge bg-secondary">Pending</span>;
      case "IN PROGRESS":
        return <span className="badge bg-info text-dark">In progress</span>;
      case "FIXED":
        return <span className="badge bg-success">Fixed</span>;
      default:
        return <span className="badge bg-secondary">{flow || "N/A"}</span>;
    }
  };

  // Ajustado a 7 columnas para coincidir exactamente con el <thead>
  if (isLoading) {
    return <TableSkeleton rows={5} columns={7} />;
  }

  if (isError) {
    return (
      <div
        className="alert alert-danger d-flex justify-content-between align-items-center m-3"
        role="alert"
      >
        <div>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>Error loading data.</strong> Failed to fetch reports from the
          server.
        </div>
        {/* <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => refetch()}
        >
          Retry
        </button> */}
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Equipment</th>
            <th>Flow</th>
            <th>Priority</th>
            <th>Type</th>
            <th>Reported by / date</th>
            <th>Comment</th>
            <th>Created by</th>
          </tr>
        </thead>
        <tbody>
          {reports && reports.length > 0 ? (
            reports.map((item: any) => (
              <tr key={item.equipmentsIssuesId}>
                <td>
                  {/* Corregido: Acceso al objeto anidado item.equipment */}
                  <div className="fw-bold">
                    Eq #
                    {item.equipment?.number || item.equipmentNumber || "N/A"}
                  </div>
                  <div className="small text-muted">
                    {item.equipment?.name || item.equipmentName || "No name"}
                  </div>
                </td>
                <td>{getFlowBadge(item.flow)}</td>
                <td>{getPriorityBadge(item.priorityIssue)}</td>
                <td>
                  <div className="fw-semibold">{item.typeIssue}</div>
                  <div
                    className="small text-muted text-truncate"
                    style={{ maxWidth: "180px" }}
                  >
                    {item.descriptionIssue}
                  </div>
                </td>
                <td>
                  <div>{item.reportedBy}</div>
                  <div className="small text-muted">
                    {formatToUSDate(item.reportedDate)}
                  </div>
                </td>
                <td>
                  <div className="small">
                    <strong>Comment:</strong> {item.details || "N/A"}
                  </div>
                  {item.comments && (
                    <div className="small text-muted">
                      <strong>Obs:</strong> {item.comments}
                    </div>
                  )}
                </td>
                <td className="small text-muted">
                  <div>By: {item.createdBy || "-"}</div>
                  <div>Upd: {item.updatedBy || "-"}</div>
                </td>
              </tr>
            ))
          ) : (
            /* Estado vacío cuando no hay registros */
            <tr>
              <td colSpan={7} className="text-center py-4 text-muted">
                No issues found matching the selected criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ValidatedReportsTable;
