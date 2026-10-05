import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  EquipmentIssueCreateDto,
  IssueCreate,
} from "../types";
import { api } from "./apiConfig";

const createIssue = async (issueData: IssueCreate) => {
  const { data } = await api.post("v1/issue", issueData);
  return data; // Asegúrate de que el backend retorne el objeto creado con su 'id'
};

const createIssueMaintenance = async (payload: EquipmentIssueCreateDto) => {
  const { data } = await api.post("/v2/maintenance/issue", payload);
  return data;
};

export function useValidateIssueProcess() {
  const queryClient = useQueryClient();

  const issueMutation = useMutation({ mutationFn: createIssue });
  const maintenanceMutation = useMutation({
    mutationFn: createIssueMaintenance,
  });

  const processValidation = async (
    issuePayload: IssueCreate,
    maintenancePayload: EquipmentIssueCreateDto,
  ) => {
    let createdIssueId: number | null = null;

    try {
      // 1. Ejecutar primer Microservicio (Crear Issue)
      const issueResponse = await issueMutation.mutateAsync(issuePayload);

      // Asumimos que el backend retorna el objeto con su ID (ej. issueResponse.id o issueResponse.equipmentsIssuesId)
      // createdIssueId = issueResponse.equipmentsIssuesId || issueResponse.id;
      createdIssueId = issueResponse.equipmentsIssuesId || issueResponse.id;
      if (createdIssueId) {
        const payload: EquipmentIssueCreateDto = {
          ...maintenancePayload,
          issueData: {
            ...maintenancePayload.issueData,
            referenceID: createdIssueId,
          },
        };

        // 2. Ejecutar segundo Microservicio (Mantenimiento)
        await maintenanceMutation.mutateAsync(payload);
      }

      // 3. Éxito total: Refrescar la caché de React Query
      queryClient.invalidateQueries({ queryKey: ["issue"] });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["issueReport"] });

      return true;
    } catch (error) {
      // 4. ESTRATEGIA DE COMPENSACIÓN (ROLLBACK)
      if (createdIssueId) {
        try {
          console.warn(
            "Fallo el segundo servicio. Deshaciendo cambios en el primer servicio...",
          );
        } catch (rollbackError) {
          console.error(
            "Error crítico: No se pudo hacer el rollback del issue creado",
            rollbackError,
          );
        }
      }

      // Re-lanzar el error para que el componente UI lo capture y lo muestre
      throw error;
    }
  };

  return {
    processValidation,
    isPending: issueMutation.isPending || maintenanceMutation.isPending,
    isError: issueMutation.isError || maintenanceMutation.isError,
  };
}
