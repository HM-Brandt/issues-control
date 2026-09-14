import { useState } from "react";
import type { issueReport } from "../types";
import { TableSkeleton } from "./TableSkeleton";
import { ValidateReportModal } from "./ValidateReportModal";
import useEquipments from "../hooks/useEquipments";
import { formatUTCTime } from "../utils/dateFormat";

type Props = {
  reports?: issueReport[];
  getPriorityBadge: any;
  isLoading: boolean;
  isError: boolean;
};

function PendingReportsTable({
  reports,
  getPriorityBadge,
  isLoading,
  isError,
}: Props) {
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const { data: equipments } = useEquipments();

  if (isLoading) {
    return <TableSkeleton rows={5} columns={8} />;
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
    <>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Equip No.</th>
              <th>Reported by</th>
              <th>Priority</th>
              <th>Type</th>
              <th>Description</th>
              <th>Reported date</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Si no hay datos, mostramos un mensaje explicativo */}
            {reports && reports.length > 0 ? (
              reports.map((item: issueReport) => {
                const equip = equipments?.find(
                  (e) => e.equipmentsId === item.equipmentId,
                );
                return (
                  <tr key={item.id}>
                    <td className="fw-bold">#{item.id}</td>
                    <td>
                      <div className="d-flex flex-column align-items-start">
                        <span className="badge bg-light text-dark border mb-1">
                          {/* Acceso directo al objeto anidado que envía Jackson */}
                          Eq #{equip?.number || "N/A"}
                        </span>
                        <small className="text-muted fw-normal">
                          {equip?.name || "No name"}
                        </small>
                      </div>
                    </td>
                    <td>{item.reportedBy}</td>
                    <td>{getPriorityBadge(item.priorityIssue)}</td>
                    <td>{item.typeIssue}</td>
                    <td className="text-truncate" style={{ maxWidth: "200px" }}>
                      {item.descriptionIssue}
                    </td>
                    <td className="small text-muted">
                      {item.createdAt ? formatUTCTime(item.createdAt) : "-"}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setSelectedReport(item)}
                      >
                        View & Validate
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              /* Estado vacío cuando la lista es [] */
              <tr>
                <td colSpan={8} className="text-center py-4 text-muted">
                  No reports found matching the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ValidateReportModal
        report={selectedReport}
        show={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
      />
    </>
  );
}

export default PendingReportsTable;
