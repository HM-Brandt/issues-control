import { useQuery } from "@tanstack/react-query";
import { api } from "./apiConfig";
import type { Issue, PageResponse, UseGetIssuesParams } from "../types";

const queryIssues = async (
  params: UseGetIssuesParams = {},
): Promise<PageResponse<Issue>> => {
  const {
    flow,
    page = 0,
    size = 10,
    sortBy = "equipment.number",
    direction = "DESC",
    searchTerm,
    priorityFilter,
    typeFilter,
  } = params;

  const response = await api.get<PageResponse<Issue>>("v1/issues/pages", {
    params: {
      ...(flow && { flow }),
      page,
      size,
      sortBy,
      direction,
      // Se envían los filtros únicamente si tienen un valor válido
      search: searchTerm?.trim() || undefined,
      priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
      type: typeFilter !== "ALL" ? typeFilter : undefined,
    },
  });

  return response.data;
};

function useGetIssues(params: UseGetIssuesParams = {}) {
  const {
    flow,
    page = 0,
    size = 10,
    sortBy = "reportedDate",
    direction = "DESC",
    searchTerm = "",
    priorityFilter = "ALL",
    typeFilter = "ALL",
  } = params;

  return useQuery({
    // Todos los filtros incluidos en la queryKey para invalidar la caché automáticamente
    queryKey: [
      "issues",
      {
        flow,
        page,
        size,
        sortBy,
        direction,
        searchTerm,
        priorityFilter,
        typeFilter,
      },
    ],
    queryFn: () => queryIssues(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    placeholderData: (previousData) => previousData,
  });
}

export default useGetIssues;
