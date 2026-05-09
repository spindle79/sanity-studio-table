import {
  type ComponentType,
  type PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";

import {
  TableContext,
  type TableContextValue,
  type TableSort,
} from "./TableContext";

export type { TableSort } from "./TableContext";

/**
 * Wraps the table in a sort + search state context.
 *
 * `<Table>` already mounts a `TableProvider` internally — you only need
 * to mount this manually if you want to share table state with components
 * outside the table (e.g. an external search box).
 */
export const TableProvider: ComponentType<
  PropsWithChildren & { defaultSort?: TableSort }
> = ({ children, defaultSort }) => {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [sort, setSort] = useState<TableSort | null>(defaultSort || null);

  const setSortColumn = useCallback((newColumn: string) => {
    setSort((s) => {
      if (s?.column === newColumn) {
        return { ...s, direction: s.direction === "asc" ? "desc" : "asc" };
      }
      return { column: String(newColumn), direction: "desc" };
    });
  }, []);

  const contextValue: TableContextValue = {
    searchTerm,
    setSearchTerm,
    sort,
    setSortColumn,
  };

  return (
    <TableContext.Provider value={contextValue}>{children}</TableContext.Provider>
  );
};

export const useTableContext = (): TableContextValue => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTableContext must be used within a TableProvider");
  }
  return context;
};
