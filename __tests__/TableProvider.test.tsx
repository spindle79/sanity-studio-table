// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { TableProvider, useTableContext } from "../src/TableProvider";

function wrapWith({
  defaultSort,
}: {
  defaultSort?: { column: string; direction: "asc" | "desc" };
}) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <TableProvider defaultSort={defaultSort}>{children}</TableProvider>;
  };
}

describe("TableProvider — sort state reducer", () => {
  it("starts with no sort by default", () => {
    const { result } = renderHook(() => useTableContext(), {
      wrapper: wrapWith({}),
    });
    expect(result.current.sort).toBeNull();
  });

  it("respects the defaultSort prop", () => {
    const { result } = renderHook(() => useTableContext(), {
      wrapper: wrapWith({ defaultSort: { column: "title", direction: "asc" } }),
    });
    expect(result.current.sort).toEqual({ column: "title", direction: "asc" });
  });

  it("setSortColumn on a new column sets direction to 'desc'", () => {
    const { result } = renderHook(() => useTableContext(), {
      wrapper: wrapWith({}),
    });

    act(() => {
      result.current.setSortColumn("title");
    });
    expect(result.current.sort).toEqual({ column: "title", direction: "desc" });
  });

  it("setSortColumn on the same column toggles direction (desc → asc)", () => {
    const { result } = renderHook(() => useTableContext(), {
      wrapper: wrapWith({ defaultSort: { column: "title", direction: "desc" } }),
    });

    act(() => {
      result.current.setSortColumn("title");
    });
    expect(result.current.sort).toEqual({ column: "title", direction: "asc" });
  });

  it("setSortColumn on the same column toggles direction (asc → desc)", () => {
    const { result } = renderHook(() => useTableContext(), {
      wrapper: wrapWith({ defaultSort: { column: "title", direction: "asc" } }),
    });

    act(() => {
      result.current.setSortColumn("title");
    });
    expect(result.current.sort).toEqual({ column: "title", direction: "desc" });
  });

  it("setSortColumn on a different column resets direction to 'desc'", () => {
    const { result } = renderHook(() => useTableContext(), {
      wrapper: wrapWith({ defaultSort: { column: "title", direction: "asc" } }),
    });

    act(() => {
      result.current.setSortColumn("updatedAt");
    });
    expect(result.current.sort).toEqual({
      column: "updatedAt",
      direction: "desc",
    });
  });

  it("multiple toggles cycle desc → asc → desc", () => {
    const { result } = renderHook(() => useTableContext(), {
      wrapper: wrapWith({}),
    });

    act(() => {
      result.current.setSortColumn("title");
    });
    expect(result.current.sort?.direction).toBe("desc");

    act(() => {
      result.current.setSortColumn("title");
    });
    expect(result.current.sort?.direction).toBe("asc");

    act(() => {
      result.current.setSortColumn("title");
    });
    expect(result.current.sort?.direction).toBe("desc");
  });
});

describe("TableProvider — search state", () => {
  it("starts with searchTerm null", () => {
    const { result } = renderHook(() => useTableContext(), {
      wrapper: wrapWith({}),
    });
    expect(result.current.searchTerm).toBeNull();
  });

  it("setSearchTerm updates the value", () => {
    const { result } = renderHook(() => useTableContext(), {
      wrapper: wrapWith({}),
    });

    act(() => {
      result.current.setSearchTerm("hello");
    });
    expect(result.current.searchTerm).toBe("hello");

    act(() => {
      result.current.setSearchTerm("");
    });
    expect(result.current.searchTerm).toBe("");
  });
});

describe("useTableContext — error path", () => {
  it("throws when used outside a TableProvider", () => {
    // Suppress React's expected error log for this test.
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useTableContext())).toThrow(
      /must be used within a TableProvider/
    );
    errSpy.mockRestore();
  });
});
