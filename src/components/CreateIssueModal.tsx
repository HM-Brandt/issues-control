import { useState } from "react";
import type { IssueCreate } from "../types";
import useEmployees from "../hooks/useEmployees";
import useEquipments from "../hooks/useEquipments";
import { useAuthStore } from "../stores/authStore";
import useUser from "../hooks/useUser";

interface CreateIssueModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (
    issuePayload: IssueCreate,
    equipmentId: number,
  ) => Promise<void> | void;
  isLoading?: boolean;
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  show,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { data: employees = [], isLoading: isLoadingEmployees } =
    useEmployees();
  const { data: equipments = [], isLoading: isLoadingEquipments } =
    useEquipments();

  const filteredEmployees = employees?.filter(
    (emp) =>
      emp.status === "Active" &&
      emp.employeesId != 51 &&
      (emp.title === "Labor" || emp.title === "Supervisor"),
  );

  const sortedEmployees = filteredEmployees?.sort((a, b) =>
    a.firstName.localeCompare(b.firstName),
  );

  const orderedEquipments = [...equipments].sort((a, b) =>
    a.number.localeCompare(b.number, undefined, { numeric: true }),
  );

  // Estados del formulario
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | "">(
    "",
  );
  const [priorityIssue, setPriorityIssue] = useState("Low");
  const [typeIssue, setTypeIssue] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [descriptionIssue, setDescriptionIssue] = useState("");
  const [details, setDetails] = useState("");
  const { isLoading: loadignUser } = useUser();
  const { user } = useAuthStore();

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEquipmentId) return;

    // Obtener la fecha y hora actual en formato ISO UTC para la base de datos
    const todayDate = new Date().toISOString().split("T")[0];

    // Mapeo hacia la interfaz IssueCreate
    const issuePayload: IssueCreate = {
      equipmentsIssuesId: 0, // El backend genera la secuencia/ID al insertar
      checklistsId: 1, // Ajustar si aplica un ID de checklist por defecto
      equipmentsId: Number(selectedEquipmentId),
      flow: "Pending",
      reportedBy,
      reportedDate: todayDate,
      priorityIssue,
      typeIssue,
      descriptionIssue,
      details,
      createdBy: user?.email || "SYSTEM",
      updatedBy: user?.email || "SYSTEM",
    };

    await onSubmit(issuePayload, Number(selectedEquipmentId));

    // Resetear el formulario tras guardar
    setSelectedEquipmentId("");
    setPriorityIssue("MEDIUM");
    setTypeIssue("Blown Hose");
    setReportedBy("");
    setDescriptionIssue("");
    setDetails("");
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>

      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        style={{ zIndex: 1055 }}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content shadow border-0">
            <div className="modal-header bg-light">
              <h5 className="modal-title fw-bold text-dark">
                Create New Issue
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={isLoading}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                <div className="row g-3">
                  {/* Select: Equipment */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary small">
                      Equipment <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={selectedEquipmentId}
                      onChange={(e) =>
                        setSelectedEquipmentId(Number(e.target.value))
                      }
                      required
                      disabled={isLoading || isLoadingEquipments}
                    >
                      <option value="">
                        {isLoadingEquipments
                          ? "Loading equipments..."
                          : "Select Equipment"}
                      </option>
                      {orderedEquipments.map((eq: any, index: number) => {
                        const equipmentId = eq.equipmentsId ?? eq.id ?? index;
                        return (
                          <option
                            key={`equipment-${equipmentId}`}
                            value={eq.id ?? eq.equipmentsId}
                          >
                            {eq.equipmentNumber || eq.number}{" "}
                            {eq.name ? `- ${eq.name}` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Reported By */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary small">
                      Reported By
                    </label>
                    <select
                      className="form-select"
                      value={reportedBy}
                      onChange={(e) => setReportedBy(e.target.value)}
                      disabled={isLoading || isLoadingEmployees}
                    >
                      <option value="">
                        {isLoadingEmployees
                          ? "Loading employees..."
                          : "Select Employee"}
                      </option>
                      {sortedEmployees.map((emp: any) => {
                        const name =
                          emp.fullName || `${emp.firstName} ${emp.lastName}`;
                        return (
                          <option key={emp.id} value={name}>
                            {name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary small">
                      Priority <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={priorityIssue}
                      onChange={(e) => setPriorityIssue(e.target.value)}
                      required
                      disabled={isLoading}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  {/* Issue Type */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary small">
                      Issue Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={typeIssue}
                      onChange={(e) => setTypeIssue(e.target.value)}
                      required
                      disabled={isLoading}
                    >
                      <option value="">Select type</option>
                      <option value="Blown Hose">
                        Blown Hose/Hydraulic Leak
                      </option>
                      <option value="Oil Leak">Oil Leak</option>
                      <option value="Other Fluid Leak">Other Fluid Leak</option>
                      <option value="Overheating">Overheating</option>
                      <option value="Won't start">Won't start</option>
                      <option value="Physical damage">Physical damage</option>
                      <option value="Won't track/move">Won't track/move</option>
                      <option value="Low Power">Low Power</option>
                      <option value="Control/electrical issue">
                        Control/electrical issue
                      </option>
                      <option value="Smoke/smell">Smoke/smell</option>
                      <option value="Weird Sounds">Weird Sounds</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-secondary small">
                      Summary / Description{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Brief title describing the failure"
                      value={descriptionIssue}
                      onChange={(e) => setDescriptionIssue(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Details */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-secondary small">
                      Detailed Breakdown
                    </label>
                    <textarea
                      rows={3}
                      className="form-control"
                      placeholder="Additional details..."
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  disabled={isLoading || loadignUser}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 fw-semibold"
                  disabled={isLoading || loadignUser}
                >
                  {(isLoading || loadignUser) && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                  )}
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
