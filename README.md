# sanity-studio-table

> Virtualized table primitive for Sanity Studio plugins. Built on `@sanity/ui` + `@tanstack/react-virtual`, with built-in sort + search context, custom column definitions, and a row-actions slot.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **At a glance** — Sanity Studio doesn't ship a generic table primitive that plugin authors can use to render lists of documents (or anything else) with virtualization, sorting, search, and per-row actions. This package is that primitive, extracted from a private monorepo where it backed three separate Studio plugins.
>
> What you get:
>
> - **Virtualized rows** via `@tanstack/react-virtual` — handles thousands of rows without breaking the studio's render budget
> - **Custom column definitions** — define `header`, `cell`, `sortTransform`, `width`, `style`, and a `hidden` flag per column
> - **Built-in sort + search context** — `<TableProvider>` mounts automatically inside `<Table>`, but can be hoisted if you want to share state with external controls
> - **Pre-built header renderers** — `Headers.SortHeaderButton`, `Headers.TableHeaderSearch`, `Headers.BasicHeader` cover the common cases without you re-rolling them
> - **`@sanity/ui` styled** so the table fits the studio's visual language out of the box
> - **No internal Sanity APIs** — this package owns its own context (the original imported `TableContext` from `sanity/_singletons`, an internal-only path; that's been replaced)
> - **No `lodash` or `date-fns`** — the small subset of helpers needed (`get`, `isValid`) are inlined

## Install

```bash
npm install sanity-studio-table
```

`react`, `@sanity/icons`, and `@sanity/ui` are peer deps and should already be in your studio's `package.json`. `motion` and `@tanstack/react-virtual` are real deps and install automatically.

## Quickstart

```tsx
import { Table, Headers, type Column } from "sanity-studio-table";
import { useRef } from "react";

interface Doc {
  _id: string;
  title: string;
  _updatedAt: string;
}

export function MyDocList({ data }: { data: Doc[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const columns: Column<Doc>[] = [
    {
      id: "title",
      width: null,
      sorting: true,
      header: (props) => <Headers.SortHeaderButton {...props} text="Title" />,
      cell: ({ datum }) => <span>{datum.title}</span>,
    },
    {
      id: "_updatedAt",
      width: 200,
      sorting: true,
      header: (props) => <Headers.SortHeaderButton {...props} text="Updated" />,
      cell: ({ datum }) => (
        <span>{new Date(datum._updatedAt).toLocaleString()}</span>
      ),
    },
    {
      id: "search",
      width: null,
      header: (props) => <Headers.TableHeaderSearch {...props} />,
    },
  ];

  return (
    <div ref={scrollRef} style={{ height: 600, overflow: "auto" }}>
      <Table<Doc>
        data={data}
        columnDefs={columns}
        rowId="_id"
        emptyState="No documents yet"
        scrollContainerRef={scrollRef.current}
        searchFilter={(rows, term) =>
          rows.filter((r) =>
            r.title.toLowerCase().includes(term.toLowerCase())
          )
        }
      />
    </div>
  );
}
```

## API

### `<Table>`

| Prop | Type | Required | Description |
|---|---|---|---|
| `data` | `TableData[]` | Yes | The array of rows to render. |
| `columnDefs` | `Column<...>[]` | Yes | Column definitions (see below). |
| `rowId` | `string` | Yes | Dot-path to a unique row identifier (`"_id"`, `"item.id"`, etc.). |
| `emptyState` | `string \| () => JSX` | Yes | Rendered when `data` is empty. Can be a string or a component. |
| `scrollContainerRef` | `HTMLDivElement \| null` | Yes | The scrolling parent for virtualization. |
| `searchFilter` | `(data, term) => TableData[]` | No | Called when the user types in the built-in search header. |
| `rowActions` | `({ datum }) => ReactNode` | No | Renders an actions cell at the right end of each row. |
| `rowProps` | `(datum) => Partial<CardProps>` | No | Per-row override of the underlying `<Card>` props (e.g. `tone`, `data-testid`). |
| `loading` | `boolean` | No | When true, renders 3 skeleton rows instead of `data`. |
| `hideTableInlinePadding` | `boolean` | No | Default false. The table aligns to the studio's `container[3]` width via theme tokens — set true to render edge-to-edge. |
| `defaultSort` | `{ column, direction }` | No | Initial sort state when the internal `<TableProvider>` mounts. |

### `Column<TableData>`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Stable column id used for sorting and keying. Should match a key on the row datum (or any unique string for action/utility columns). |
| `width` | `number \| null` | Pixel width, or `null` to flex. |
| `style` | `CSSProperties` | Style applied to the cell `<td>`. |
| `sorting` | `boolean` | Set true to enable click-to-sort on this column's header. |
| `sortTransform` | `(row, dir) => number \| string` | Optional. Override the sort key for this column — useful when you sort by a derived value rather than the field itself. |
| `header` | `(props) => JSX` | Renders the column header cell. Pass `Headers.SortHeaderButton`, `Headers.TableHeaderSearch`, or your own. |
| `cell` | `(props) => ReactNode` | Renders each row's cell for this column. Receives `{ datum, cellProps, sorting }`. |
| `hidden` | `true` | Set true to keep the column in the data model but skip rendering it. |

### `Headers`

Pre-built header renderers. Pass these as the `header` prop on a column.

| Helper | Use for |
|---|---|
| `Headers.SortHeaderButton` | Click-to-sort header with the @sanity/ui Button + a Framer-animated arrow. |
| `Headers.TableHeaderSearch` | Search box bound to `useTableContext().searchTerm`. Triggers your column's `searchFilter`. |
| `Headers.BasicHeader` | Disabled button — just renders the column title. |

### `TableProvider` and `useTableContext`

The table mounts its own `<TableProvider>` internally. You only need to mount one yourself if you want to share the sort/search state with components outside the table — e.g. an external "Clear filters" button that calls `setSearchTerm("")` and `setSortColumn(...)`.

```tsx
import { TableProvider, useTableContext, Table } from "sanity-studio-table";

function ExternalClearButton() {
  const { setSearchTerm } = useTableContext();
  return <button onClick={() => setSearchTerm("")}>Clear search</button>;
}

function MyToolBody() {
  return (
    <TableProvider>
      <ExternalClearButton />
      <Table {...} />
    </TableProvider>
  );
}
```

Inside a single `<Table>`, you don't need this — the internal provider handles it.

## Why not @tanstack/react-table?

`@tanstack/react-table` is a fantastic library for non-virtualized tables and complex column logic. This component uses `@tanstack/react-virtual` instead because:

1. The use case is "render a long list of Sanity documents in a tool pane" — virtualization is the dominant concern, not column features
2. The column model here is simpler (a few hundred lines of types) and `@sanity/ui`-styled by default — no theming layer to fight with
3. Plugin bundle size matters — adding the full TanStack Table to a studio plugin adds ~30 KB minified that this implementation doesn't need

If you need expandable rows, complex grouping, pinning, or column reordering, reach for `@tanstack/react-table` directly. If you need "fast scrolling list of items in a Sanity studio panel", this is lighter.

## Origin

This component was extracted from a private Sanity Studio implementation where it was used by three separate plugins (a bulk-edit grid, a manual-review queue, and an AI-generation queue) for their list views. The standalone version drops:

- The `sanity/_singletons` import (Sanity-internal path) — replaced with a local `TableContext`
- The `lodash.get` dependency — replaced with a 10-line `getByPath` helper
- The `date-fns.isValid` dependency — replaced with a small `isParseableDate` helper
- An i18n placeholder shim that was returning hardcoded strings anyway — replaced with a `placeholder` prop on the search header

## License

[MIT](LICENSE) © Adam Harris
