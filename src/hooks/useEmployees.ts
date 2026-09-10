import { useQuery } from "@tanstack/react-query";
import { api } from "./apiConfig";
import type { Employee } from "../types";

const queryEmployees = (): Promise<Employee[]> => {
  return api.get("v1/employee").then((response) => response.data);
};

function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: queryEmployees,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}

export default useEmployees;