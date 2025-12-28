import {create} from "zustand";
import { FilterData } from "@/types/filter";

interface FilterStore {
  filters: FilterData[];
  setFilters: (filters: FilterData[]) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  filters: [],
  setFilters: (filters) => set({ filters }),
}));
