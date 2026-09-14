import { useState } from "react";
import { useValidateIssueProcess } from "../hooks/useIssue";
import type {
  EquipmentIssueRequestDto,
  IssueCreate,
  issueReport,
} from "../types";
import useEquipments from "../hooks/useEquipments";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/useNotificationStore";
type Props = {
  report: issueReport | null; // El reporte seleccionado para validar
  show: boolean;
  onClose: () => void;
};

export function ValidateReportModal({ report, show, onClose }: Props) {
  const { processValidation, isPending } = useValidateIssueProcess();
  const [details, setDetails] = useState("");
  const { data: equipments } = useEquipments();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { notify } = useNotificationStore();

  if (!show || !report) return null;

  const equipmentSelected = equipments?.find(
    (equip) => equip.equipmentsId === report.equipmentId,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Payload 1: Primer Microservicio
    const issuePayload: IssueCreate = {
      issueReportId: report.id,
      equipmentsIssuesId: 0,
      checklistsId: 1,
      equipmentsId: report.equipmentId,
      flow: "Pending",
      reportedBy: report.reportedBy,
      reportedDate: report.createdAt,
      priorityIssue: report.priorityIssue,
      typeIssue: report.typeIssue,
      descriptionIssue: report.descriptionIssue,
      details: details,
      createdBy: user?.email || "User not found",
      updatedBy: user?.email || "User not found",
    };

    // Payload 2: Segundo Microservicio (Mantenimiento)
    const maintenancePayload: EquipmentIssueRequestDto = {
      equipmentId: report.equipmentId,
      reportedBy: report.reportedBy,
      issueDescription: report.descriptionIssue,
      severity: report.priorityIssue || "HIGH",
      userName: user?.email || "User not found",
      referenceID: 0,
      issueType: report.typeIssue,
      details: details,
    };

    try {
      // Ejecuta la Saga
      await processValidation(issuePayload, maintenancePayload);

      notify({
        title: "Validation Successful",
        message: `Issue report #${report.id} was validated and processed successfully.`,
        type: "success",
      });

      onClose(); // Cierra el modal solo si todo salió bien
    } catch (err: any) {
      setErrorMessage(
        "The process could not be completed on both services. The changes were reverted.",
      );
      notify({
        title: "Validation Failed",
        message: "The process could not be completed. Changes were reverted.",
        type: "error",
      });
    }
  };

  return (
    <div
      className="modal show d-block bg-dark bg-opacity-25 backdrop-blur"
      tabIndex={-1}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "640px" }}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header Minimalista */}
          <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex align-items-start justify-content-between">
            <div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill mb-1 fw-semibold px-2 py-1 small">
                Validation Process
              </span>
              <h5 className="modal-title fw-bold text-dark fs-5">
                Validate Issue Report #{report.id}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close shadow-none opacity-50"
              onClick={onClose}
              disabled={isPending}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="alert alert-danger py-2 small mb-3">
                {errorMessage}
              </div>
            )}
            <div className="modal-body p-4">
              {/* Tarjeta de Resumen del Reporte (Clean Card) */}
              <div className="bg-light bg-opacity-50 border rounded-3 p-3 mb-4">
                {/* Fila Principal: Equipo + Prioridad */}
                <div className="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom border-light-subtle">
                  <div>
                    <span
                      className="text-uppercase tracking-wider text-muted fw-bold d-block"
                      style={{ fontSize: "0.68rem" }}
                    >
                      Equipment
                    </span>
                    <span className="fw-semibold text-dark fs-6">
                      Eq #{equipmentSelected?.number || "N/A"}
                    </span>
                    <span className="text-muted small ms-2">
                      ({equipmentSelected?.name || "No Name"})
                    </span>
                  </div>
                  <div className="text-end">
                    <span
                      className="text-uppercase tracking-wider text-muted fw-bold d-block mb-1"
                      style={{ fontSize: "0.68rem" }}
                    >
                      Priority
                    </span>
                    <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2.5 py-1">
                      {report.priorityIssue}
                    </span>
                  </div>
                </div>

                {/* Detalles Secundarios */}
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <span
                      className="text-uppercase tracking-wider text-muted fw-bold d-block"
                      style={{ fontSize: "0.68rem" }}
                    >
                      Type Issue
                    </span>
                    <span className="small fw-medium text-dark">
                      {report.typeIssue}
                    </span>
                  </div>
                  <div className="col-6">
                    <span
                      className="text-uppercase tracking-wider text-muted fw-bold d-block"
                      style={{ fontSize: "0.68rem" }}
                    >
                      Reported By / Date
                    </span>
                    <span className="small text-dark d-block text-truncate">
                      {report.reportedBy}
                    </span>
                    <span
                      className="text-muted"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <span
                    className="text-uppercase tracking-wider text-muted fw-bold d-block mb-1"
                    style={{ fontSize: "0.68rem" }}
                  >
                    Issue Description
                  </span>
                  <p className="small text-secondary mb-0 bg-white p-2.5 rounded border border-light-subtle">
                    {report.descriptionIssue || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Form Inputs (Minimalist Fields) */}
              <div className="row g-3 mb-3">
                {/* <div className="col-md-12">
                  <label
                    className="form-label text-uppercase text-muted fw-bold tracking-wider mb-1"
                    style={{ fontSize: "0.68rem" }}
                  >
                    Initial Flow Status
                  </label>
                  <select
                    className="form-select form-select-sm border-light-subtle rounded-3 shadow-none bg-light bg-opacity-25"
                    value={flow}
                    onChange={(e) => setFlow(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In progress">In progress</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                </div> */}

                <div className="col-md-12">
                  <label
                    className="form-label text-uppercase text-muted fw-bold tracking-wider mb-1 d-flex justify-content-between"
                    style={{ fontSize: "0.68rem" }}
                  >
                    <span>Technical Details & Diagnosis</span>
                    <span className="text-danger">* Required</span>
                  </label>
                  <textarea
                    className="form-control form-control-sm border-light-subtle rounded-3 shadow-none bg-light bg-opacity-25"
                    rows={3}
                    placeholder="Write action plan, diagnosis or comments..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Footer Minimalista */}
            <div className="modal-footer border-0 pt-0 pb-4 px-4 gap-2">
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none text-muted fw-semibold me-auto px-0"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-sm btn-primary rounded-3 px-4 fw-medium shadow-sm"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Validating...
                  </>
                ) : (
                  "Confirm & Create Issue"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
