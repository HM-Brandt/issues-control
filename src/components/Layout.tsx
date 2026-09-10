import { useEffect, useState } from "react";
import PendingReportsTable from "./PendingReportsTable";
import ValidatedReportsTable from "./ValidatedReportsTable";
import logo from "../assets/hmbLogo.png";
import { MdAdd, MdKeyboardArrowLeft, MdLogout } from "react-icons/md";
import useGetIssues from "../hooks/useEquipmentIssues";
import { useDebounce } from "../hooks/useDebounce";
import { Pagination } from "./Pagination";
import { useGetReports } from "../hooks/useIssueReports";
import { useAuthStore } from "../stores/authStore";
import { CreateIssueModal } from "./CreateIssueModal";
import { useValidateIssueProcess } from "../hooks/useIssue";
import type { EquipmentIssueRequestDto, IssueCreate } from "../types";
import { api } from "../hooks/apiConfig";

type Props = {};

function Layout({}: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { processValidation, isPending } = useValidateIssueProcess();
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'validated'
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [flow, setFlow] = useState<string>("Pending");
  const [page, setPage] = useState(0);
  const { user } = useAuthStore();
  const pageSize = 8;

  const [isLoading, setIsLoading] = useState(false);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const logout = useAuthStore((state) => state.logout);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearchTerm, priorityFilter, typeFilter, flow, activeTab]);

  const handleCleanFilters = () => {
    setSearchTerm("");
    setPriorityFilter("ALL");
    setTypeFilter("ALL");
    setFlow("Pending");
    setPage(0); // Reset page
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      if (refreshToken) {
        await api.post("/auth/revoke", { refreshToken });
      }
    } catch (error) {
      console.error(
        "Error al revocar token, cerrando sesión localmente...",
        error,
      );
    } finally {
      logout();
      window.location.href = "https://ckarlosdev.github.io/login/";
    }
  };

  const handleCreateIssueSubmit = async (
    issuePayload: IssueCreate,
    equipmentId: number,
  ) => {
    try {
      // Mapeo adaptado a las propiedades exactas de EquipmentIssueRequestDto
      const maintenancePayload: EquipmentIssueRequestDto = {
        equipmentId: equipmentId,
        reportedBy: issuePayload.reportedBy,
        issueDescription: issuePayload.descriptionIssue, // Se mapea desde descriptionIssue
        severity: issuePayload.priorityIssue, // Se mapea desde priorityIssue
        userName: issuePayload.createdBy || issuePayload.reportedBy || "SYSTEM",
      };

      // Procesa la transacción doble
      await processValidation(issuePayload, maintenancePayload);

      setShowCreateModal(false);
    } catch (error) {
      console.error(
        "Error al procesar la creación e integración de mantenimiento:",
        error,
      );
    }
  };

  // Petición conectada a los estados de los filtros
  const {
    data: reports,
    isFetching: isLoadingReports,
    isError: isErrorReports,
  } = useGetReports({
    page,
    size: pageSize,
    searchTerm: debouncedSearchTerm,
    priorityFilter,
    typeFilter,
  });

  const {
    data: issues,
    isFetching: isLoadingIssues,
    isError: isErrorIssues,
  } = useGetIssues({
    page,
    size: pageSize,
    sortBy: "equipment.number",
    direction: "DESC",
    searchTerm: debouncedSearchTerm, // <-- Conectado
    priorityFilter, // <-- Conectado
    typeFilter,
    flow: flow !== "ALL" ? flow : undefined,
  });

  const pendingReports = reports?.content || [];
  const totalReportes = reports?.totalElements ?? 0;
  const totalPagesReports = reports?.totalPages ?? 0;
  const validatedReports = issues?.content || [];
  const totalIssues = issues?.totalElements ?? 0;
  const totalPagesIssues = issues?.totalPages ?? 0;

  // Badges de prioridad
  const getPriorityBadge = (priority: any) => {
    const normalized = priority?.toUpperCase();
    switch (normalized) {
      case "HIGH":
        return <span className="badge bg-danger">High</span>;
      case "MEDIUM":
        return <span className="badge bg-warning text-dark">Medium</span>;
      case "LOW":
        return <span className="badge bg-info text-dark">Low</span>;
      default:
        return <span className="badge bg-secondary">{priority}</span>;
    }
  };

  const getInitials = (fullName?: string): string => {
    if (!fullName) return "U";

    const names = fullName.trim().split(/\s+/);
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }

    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <>
      <div className="container-fluid py-3 bg-light min-vh-100">
        {/* 1. Header Navigation */}
        <header className="bg-white px-4 py-3 rounded shadow-sm mb-4 border-bottom">
          <div className="row align-items-center">
            {/* LADO IZQUIERDO: Botón Back + Título */}
            <div className="col-4 d-flex align-items-center gap-2">
              <button className="btn btn-light btn-sm border d-inline-flex align-items-center gap-2 fw-semibold text-secondary px-3">
                <MdKeyboardArrowLeft />
                <span>Back</span>
              </button>
              <div className="vr mx-2 text-muted opacity-25"></div>
              <h5 className="mb-0 fw-bold text-dark">Issues Reports</h5>
            </div>

            {/* CENTRO: Logo de la Empresa */}
            <div className="col-4 text-center">
              <img
                src={logo}
                alt="Company Logo"
                style={{
                  maxHeight: "38px",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* LADO DERECHO: Espacio reservado para balancear (o info de usuario/acciones) */}
            <div className="col-md-4 col-12 d-flex align-items-center justify-content-end gap-3">
              {/* Avatar e Info del Usuario */}
              <div className="d-flex align-items-center gap-2 text-end">
                <div className="d-none d-sm-block">
                  <div className="fw-semibold text-dark small leading-tight">
                    {user?.fullName}
                  </div>
                  <div
                    className="text-muted text-truncate"
                    style={{ fontSize: "0.75rem", maxWidth: "140px" }}
                  >
                    {user?.email}
                  </div>
                </div>
                {/* Avatar Circular con Iniciales */}
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                  style={{
                    width: "36px",
                    height: "36px",
                    fontSize: "0.875rem",
                    flexShrink: 0,
                  }}
                  title={user?.fullName}
                >
                  {getInitials(user?.fullName)}
                </div>
              </div>

              <div
                className="vr text-muted opacity-25 d-none d-sm-block"
                style={{ height: "38px" }}
              ></div>

              {/* Botón de Logout */}
              <button
                className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1 fw-semibold px-2 px-sm-3"
                onClick={handleLogout}
                disabled={isLoading}
                title="Log out"
              >
                <MdLogout className="fs-6" />

                {isLoading ? (
                  <span className="d-none d-sm-inline">Logging out</span>
                ) : (
                  <>Logout</>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* 2. Tabs & Controls */}
        <div className="bg-white p-3 rounded shadow-sm mb-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center border-bottom mb-3 pb-2 gap-2">
            <ul className="nav nav-tabs border-bottom-0 mb-0">
              <li className="nav-item">
                <button
                  className={`nav-link fw-semibold ${
                    activeTab === "pending"
                      ? "active text-primary border-bottom border-primary border-3"
                      : "text-muted"
                  }`}
                  onClick={() => setActiveTab("pending")}
                >
                  Reported{" "}
                  <span className="badge bg-primary-subtle text-primary rounded-pill ms-1">
                    {totalReportes}
                  </span>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link fw-semibold ${
                    activeTab === "validated"
                      ? "active text-primary border-bottom border-primary border-3"
                      : "text-muted"
                  }`}
                  onClick={() => setActiveTab("validated")}
                >
                  Issues{" "}
                  <span className="badge bg-success-subtle text-success rounded-pill ms-1">
                    {totalIssues}
                  </span>
                </button>
              </li>
            </ul>

            {/* BOTÓN NUEVO ISSUE (Derecha) */}
            <button
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 fw-semibold px-3"
              onClick={() => setShowCreateModal(true)}
            >
              <MdAdd className="fs-5" />
              <span>New Issue</span>
            </button>
          </div>

          {/* 3. Filter Bar */}
          <div className="row g-2 align-items-center bg-light p-2 rounded">
            {/* Input Búsqueda: Ajusta su ancho si el filtro de flow está visible */}
            <div
              className={activeTab === "validated" ? "col-md-3" : "col-md-4"}
            >
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by ID, reported by, equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro de Prioridad */}
            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">All priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Filtro de Tipo */}
            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">Issues types</option>
                <option value="Blown Hose">Blown Hose/Hydraulic Leak</option>
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

            {/* Filtro exclusivo de FLOW (visible únicamente en tab 'validated') */}
            {activeTab === "validated" && (
              <div className="col-md-2">
                <select
                  className="form-select form-select-sm"
                  value={flow}
                  onChange={(e) => setFlow(e.target.value)}
                >
                  <option value="ALL">All Flows</option>
                  <option value="Pending">Pending</option>
                  <option value="In progress">In progress</option>
                  <option value="Fixed">Fixed</option>
                </select>
              </div>
            )}

            {/* Botón de Limpiar */}
            <div
              className={
                activeTab === "validated"
                  ? "col-md-1 text-end"
                  : "col-md-2 text-end"
              }
            >
              <button
                className="btn btn-sm btn-link text-decoration-none text-muted px-0"
                onClick={handleCleanFilters}
              >
                Clean filters
              </button>
            </div>
          </div>
        </div>

        {/* 4. Tab Content */}
        <div className="bg-white p-3 rounded shadow-sm">
          {activeTab === "pending" ? (
            <>
              <PendingReportsTable
                reports={pendingReports}
                getPriorityBadge={getPriorityBadge}
                isLoading={isLoadingReports}
                isError={isErrorReports}
              />
              <Pagination
                currentPage={page}
                totalPages={totalPagesReports}
                totalElements={totalReportes}
                size={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </>
          ) : (
            <>
              <ValidatedReportsTable
                reports={validatedReports}
                getPriorityBadge={getPriorityBadge}
                isLoading={isLoadingIssues}
                isError={isErrorIssues}
              />
              <Pagination
                currentPage={page}
                totalPages={totalPagesIssues}
                totalElements={totalIssues}
                size={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </>
          )}
        </div>
      </div>
      <CreateIssueModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateIssueSubmit}
        isLoading={isPending}
      />
    </>
  );
}

export default Layout;
