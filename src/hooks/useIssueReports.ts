import { useQuery } from "@tanstack/react-query";
import type { issueReport, PageResponse, UseGetReportsParams } from "../types";
import { api } from "./apiConfig";

const queryReports = async (
  params: UseGetReportsParams,
): Promise<PageResponse<issueReport>> => {
  const {
    page = 0,
    size = 10,
    sortBy = "createdAt",
    direction = "DESC",
    searchTerm,
    priorityFilter,
    typeFilter,
  } = params;

  // Construimos la query limpia mapeando las propiedades
  const queryParams: Record<string, any> = {
    page,
    size,
    sortBy,
    direction,
  };

  // 1. Revisa si el backend espera 'search', 'searchTerm', 'q' o 'query'
  if (searchTerm && searchTerm.trim() !== "") {
    queryParams.search = searchTerm.trim(); // <-- Cambia la clave si el backend la llama distinto
  }

  // 2. Revisa si el backend espera 'priority' o 'priorityFilter'
  if (priorityFilter && priorityFilter !== "ALL") {
    queryParams.priority = priorityFilter;
  }

  // 3. Revisa si el backend espera 'type', 'issueType' o 'typeFilter'
  if (typeFilter && typeFilter !== "ALL") {
    queryParams.type = typeFilter;
  }

  const response = await api.get<PageResponse<issueReport>>(
    "v1/issue-reports/actives",
    { params: queryParams },
  );

  return response.data;
};

export function useGetReports(params: UseGetReportsParams = {}) {
  return useQuery({
    // La clave DEBE incluir los campos individuales o el objeto entero 'params'
    queryKey: [
      "issueReport",
      {
        page: params.page,
        searchTerm: params.searchTerm,
        priorityFilter: params.priorityFilter,
        typeFilter: params.typeFilter,
      },
    ],
    queryFn: () => queryReports(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    placeholderData: (previousData) => previousData,
  });
}
