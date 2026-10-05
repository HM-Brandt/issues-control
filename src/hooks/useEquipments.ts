import { useQuery } from "@tanstack/react-query";
import { api } from "./apiConfig";
import type { Equipment } from "../types";

const queryEquipments = async (): Promise<Equipment[]> => {
  const response = await api.get<Equipment[]>("v1/equipments");
  return response.data;
};

function useEquipments() {
  return useQuery({
    queryKey: ["equipments"],
    queryFn: queryEquipments,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}

export default useEquipments;