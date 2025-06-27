# React vs Svelte: SQLRooms Implementation Comparison

This document provides side-by-side comparisons of key SQLRooms concepts implemented in both React and Svelte, making it easy to understand the translation between frameworks.

## 📚 Core Concepts Mapping

| Concept | React (Current) | Svelte (New) |
|---------|----------------|--------------|
| **State Management** | Zustand stores | Svelte stores |
| **Components** | JSX components | .svelte files |
| **Props** | Props interface | `export let` |
| **State** | useState/store selectors | Reactive variables |
| **Effects** | useEffect | Reactive statements ($:) |
| **Context** | React Context | Svelte Context |
| **Event Handling** | onClick props | on:click directives |

## 🏪 Store Implementation

### React (Zustand) - `packages/room-store/`
```typescript
import { create } from 'zustand';

interface RoomState {
  config: RoomConfig;
  room: {
    isLoading: boolean;
    error: string | null;
  };
  setLoading: (loading: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  config: initialConfig,
  room: { isLoading: false, error: null },
  setLoading: (loading) => set((state) => ({ 
    room: { ...state.room, isLoading: loading } 
  })),
}));

// Usage in component
function MyComponent() {
  const isLoading = useRoomStore(state => state.room.isLoading);
  const setLoading = useRoomStore(state => state.setLoading);
  
  return <div>{isLoading ? 'Loading...' : 'Ready'}</div>;
}
```

### Svelte - `packages/svelte-room-store/`
```typescript
import { writable, derived } from 'svelte/store';

interface RoomState {
  config: RoomConfig;
  room: {
    isLoading: boolean;
    error: string | null;
  };
}

export const roomStore = writable<RoomState>({
  config: initialConfig,
  room: { isLoading: false, error: null }
});

export const isLoading = derived(roomStore, $store => $store.room.isLoading);

export function setLoading(loading: boolean) {
  roomStore.update(state => ({
    ...state,
    room: { ...state.room, isLoading: loading }
  }));
}
```

```svelte
<!-- Usage in component -->
<script>
  import { isLoading, setLoading } from './store';
</script>

<div>{$isLoading ? 'Loading...' : 'Ready'}</div>
```

## 🧩 Component Architecture

### React Component - `packages/ui/src/Button.tsx`
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  children, 
  onClick 
}: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Usage
<Button variant="primary" onClick={() => console.log('clicked')}>
  Click me
</Button>
```

### Svelte Component - `packages/svelte-ui/src/Button.svelte`
```svelte
<script lang="ts">
  export let variant: 'primary' | 'secondary' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
</script>

<button 
  class="btn btn-{variant} btn-{size}"
  {disabled}
  on:click
>
  <slot />
</button>

<!-- Usage -->
<Button variant="primary" on:click={() => console.log('clicked')}>
  Click me
</Button>
```

## 🎣 Hooks vs Reactive Patterns

### React Hook Pattern - `packages/duckdb/src/useSql.ts`
```tsx
import { useState, useEffect } from 'react';
import { useRoomStore } from '@sqlrooms/room-store';

export function useSql<T>(query: string) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const connector = useRoomStore(state => state.db.getConnector());
  
  useEffect(() => {
    if (!query || !connector) return;
    
    setIsLoading(true);
    setError(null);
    
    connector.query(query)
      .then(result => {
        setData(result.toArray());
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [query, connector]);
  
  return { data, isLoading, error };
}

// Usage in component
function QueryResults() {
  const { data, isLoading, error } = useSql<EarthquakeData>(
    'SELECT * FROM earthquakes LIMIT 10'
  );
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {data?.map(row => <div key={row.id}>{row.name}</div>)}
    </div>
  );
}
```

### Svelte Reactive Pattern - `packages/svelte-duckdb/src/sql.ts`
```typescript
import { writable, derived } from 'svelte/store';
import { roomStore } from '@sqlrooms/svelte-room-store';

export function createSqlQuery<T>(query: string) {
  const data = writable<T[] | null>(null);
  const isLoading = writable(false);
  const error = writable<string | null>(null);
  
  const connector = derived(roomStore, $store => $store.db?.getConnector());
  
  async function execute() {
    const $connector = get(connector);
    if (!query || !$connector) return;
    
    isLoading.set(true);
    error.set(null);
    
    try {
      const result = await $connector.query(query);
      data.set(result.toArray());
    } catch (err) {
      error.set(err instanceof Error ? err.message : 'Query failed');
    } finally {
      isLoading.set(false);
    }
  }
  
  return { data, isLoading, error, execute };
}
```

```svelte
<!-- Usage in component -->
<script lang="ts">
  import { createSqlQuery } from '@sqlrooms/svelte-duckdb';
  
  const { data, isLoading, error, execute } = createSqlQuery<EarthquakeData>(
    'SELECT * FROM earthquakes LIMIT 10'
  );
  
  // Execute on mount
  import { onMount } from 'svelte';
  onMount(execute);
</script>

{#if $isLoading}
  <div>Loading...</div>
{:else if $error}
  <div>Error: {$error}</div>
{:else if $data}
  <div>
    {#each $data as row (row.id)}
      <div>{row.name}</div>
    {/each}
  </div>
{/if}
```

## 🎯 Context and Dependency Injection

### React Context - `packages/room-shell/src/RoomShell.tsx`
```tsx
import { createContext, useContext } from 'react';

const RoomContext = createContext<RoomStore | null>(null);

export function RoomShell({ 
  roomStore, 
  children 
}: { 
  roomStore: RoomStore;
  children: React.ReactNode;
}) {
  return (
    <RoomContext.Provider value={roomStore}>
      <div className="room-shell">
        {children}
      </div>
    </RoomContext.Provider>
  );
}

export function useRoomContext() {
  const store = useContext(RoomContext);
  if (!store) throw new Error('useRoomContext must be used within RoomShell');
  return store;
}

// Usage
function App() {
  return (
    <RoomShell roomStore={roomStore}>
      <MyComponent />
    </RoomShell>
  );
}
```

### Svelte Context - `packages/svelte-room-shell/src/RoomShell.svelte`
```svelte
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  
  export let roomStore: Writable<any>;
  
  setContext('roomStore', roomStore);
</script>

<div class="room-shell">
  <slot />
</div>
```

```typescript
// packages/svelte-room-shell/src/context.ts
import { getContext } from 'svelte';
import type { Writable } from 'svelte/store';

export function getRoomContext(): Writable<any> {
  const store = getContext<Writable<any>>('roomStore');
  if (!store) throw new Error('getRoomContext must be used within RoomShell');
  return store;
}
```

```svelte
<!-- Usage -->
<script>
  import RoomShell from '@sqlrooms/svelte-room-shell';
  import { roomStore } from './store';
</script>

<RoomShell {roomStore}>
  <MyComponent />
</RoomShell>
```

## 📊 Data Table Component

### React Data Table - `packages/data-table/src/DataTable.tsx`
```tsx
interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
}

export function DataTable<T>({ data, columns, pageSize = 50 }: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(0);
  
  const paginatedData = data.slice(
    currentPage * pageSize, 
    (currentPage + 1) * pageSize
  );
  
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={String(col.key)}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td key={String(col.key)}>
                  {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          disabled={currentPage === 0}
        >
          Previous
        </button>
        <span>Page {currentPage + 1}</span>
        <button 
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={(currentPage + 1) * pageSize >= data.length}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Svelte Data Table - `packages/svelte-data-table/src/DataTable.svelte`
```svelte
<script lang="ts" generics="T">
  interface Column<T> {
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], row: T) => string;
  }
  
  export let data: T[];
  export let columns: Column<T>[];
  export let pageSize = 50;
  
  let currentPage = 0;
  
  $: paginatedData = data.slice(
    currentPage * pageSize, 
    (currentPage + 1) * pageSize
  );
  
  $: totalPages = Math.ceil(data.length / pageSize);
  
  function previousPage() {
    currentPage = Math.max(0, currentPage - 1);
  }
  
  function nextPage() {
    currentPage = Math.min(totalPages - 1, currentPage + 1);
  }
</script>

<div class="data-table">
  <table>
    <thead>
      <tr>
        {#each columns as col}
          <th>{col.header}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each paginatedData as row, i}
        <tr>
          {#each columns as col}
            <td>
              {col.render ? col.render(row[col.key], row) : String(row[col.key])}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
  
  <div class="pagination">
    <button 
      on:click={previousPage}
      disabled={currentPage === 0}
    >
      Previous
    </button>
    <span>Page {currentPage + 1} of {totalPages}</span>
    <button 
      on:click={nextPage}
      disabled={currentPage >= totalPages - 1}
    >
      Next
    </button>
  </div>
</div>
```

## 🚀 Key Benefits of Svelte Implementation

1. **Less Boilerplate**: Svelte's reactive syntax reduces code verbosity
2. **Built-in Reactivity**: No need for useEffect dependencies  
3. **Smaller Bundle Size**: Svelte compiles to vanilla JS
4. **Better Performance**: Direct DOM updates without virtual DOM
5. **Type Safety**: Full TypeScript support with better inference
6. **Simpler State**: Stores are more intuitive than hooks

## 🔄 Migration Checklist

When converting a React component to Svelte:

- [ ] Replace `interface Props` with `export let` declarations
- [ ] Convert `useState` to reactive variables
- [ ] Replace `useEffect` with reactive statements (`$:`) 
- [ ] Change event handlers from `onClick` to `on:click`
- [ ] Replace `{children}` with `<slot />`
- [ ] Convert context usage from `useContext` to `getContext`
- [ ] Replace conditional JSX with `{#if}` blocks
- [ ] Convert `.map()` rendering to `{#each}` blocks

This comparison should make it much easier to understand how SQLRooms concepts translate between React and Svelte! 