import { writable, derived, type Writable, type Readable } from 'svelte/store';
import type { BaseRoomConfig } from '@sqlrooms/room-config';

/**
 * Base interface for a room state slice
 */
export interface RoomSlice<TConfig = any, TState = any> {
  config: TConfig;
  room: TState;
}

/**
 * Type for a function that enhances a room store with additional functionality
 */
export type SvelteRoomSliceFactory<TConfig, TSliceState> = (
  store: Writable<any>
) => TSliceState;

/**
 * Combined room state type that includes config and room data
 */
export type SvelteRoomState<TConfig> = {
  config: TConfig;
  room: {
    isLoading: boolean;
    error: string | null;
    [key: string]: any;
  };
};

/**
 * Creates a Svelte room store that can be enhanced with slices
 */
export function createSvelteRoomStore<TConfig extends BaseRoomConfig, TState>(
  initialState: SvelteRoomState<TConfig> & Partial<TState>
): {
  store: Writable<SvelteRoomState<TConfig> & TState>;
  subscribe: Readable<SvelteRoomState<TConfig> & TState>['subscribe'];
  update: Writable<SvelteRoomState<TConfig> & TState>['update'];
  set: Writable<SvelteRoomState<TConfig> & TState>['set'];
} {
  const store = writable<SvelteRoomState<TConfig> & TState>(
    initialState as SvelteRoomState<TConfig> & TState
  );

  return {
    store,
    subscribe: store.subscribe,
    update: store.update,
    set: store.set,
  };
}

/**
 * Creates a room slice factory that can be composed with other slices
 */
export function createSvelteRoomSlice<TConfig extends BaseRoomConfig>(
  initialSlice: RoomSlice<TConfig>
): SvelteRoomSliceFactory<TConfig, RoomSlice<TConfig>> {
  return (store: Writable<any>) => {
    // Initialize the store with the slice data
    store.update((state) => ({
      ...state,
      ...initialSlice,
    }));

    return initialSlice;
  };
}

/**
 * Utility to create a derived store that selects a specific part of the room state
 */
export function selectFromRoomStore<TState, TSelected>(
  store: Readable<TState>,
  selector: (state: TState) => TSelected
): Readable<TSelected> {
  return derived(store, selector);
}

export * from '@sqlrooms/room-config'; 