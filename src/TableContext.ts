import { createContext } from "react";

import type { SortDirection } from "./types";

export interface TableSort {
  column: string;
  direction: SortDirection;
}

export interface TableContextValue {
  searchTerm: string | null;
  setSearchTerm: (searchTerm: string) => void;
  sort: TableSort | null;
  setSortColumn: (column: string) => void;
}

/**
 * Local context for the table's sort + search state.
 *
 * The original component imported `TableContext` from `sanity/_singletons`
 * — Sanity's internal-only path. This standalone version owns its own
 * context so it doesn't break when Sanity ships changes to the singleton
 * layout.
 */
export const TableContext = createContext<TableContextValue | null>(null);
