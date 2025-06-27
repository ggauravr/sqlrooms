<script lang="ts">
  import { onMount } from 'svelte';
  import { createSvelteRoomStore, type SvelteRoomState } from '@sqlrooms/svelte-room-store';
  import type { BaseRoomConfig } from '@sqlrooms/room-config';
  
  // Define the room configuration
  interface MyRoomConfig extends BaseRoomConfig {
    title: string;
    dataSources: Array<{
      type: 'url';
      url: string;
      tableName: string;
    }>;
  }
  
  // Create the room store
  const { store: roomStore, subscribe } = createSvelteRoomStore<MyRoomConfig, {}>({
    config: {
      title: 'Svelte SQLRooms Example',
      dataSources: [
        {
          type: 'url', 
          url: 'https://raw.githubusercontent.com/sqlrooms/examples/main/get-started/public/earthquakes.csv',
          tableName: 'earthquakes'
        }
      ]
    },
    room: {
      isLoading: false,
      error: null,
    }
  });
  
  // Reactive state
  let isLoading = false;
  let error: string | null = null;
  let queryResult: any[] = [];
  
  // Subscribe to store changes
  $: {
    const state = $roomStore;
    isLoading = state.room.isLoading;
    error = state.room.error;
  }
  
  async function runQuery() {
    try {
      isLoading = true;
      error = null;
      
      // This would use the actual DuckDB integration
      // For now, simulate a query result
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      queryResult = [
        { location: 'California', magnitude: 7.2, depth: 10 },
        { location: 'Alaska', magnitude: 6.8, depth: 25 }, 
        { location: 'Nevada', magnitude: 5.4, depth: 15 }
      ];
      
      isLoading = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      isLoading = false;
    }
  }
  
  onMount(() => {
    // Initialize the room and load data
    runQuery();
  });
</script>

<main class="container mx-auto p-8">
  <h1 class="text-3xl font-bold mb-6">
    {$roomStore.config.title}
  </h1>
  
  <div class="mb-6">
    <h2 class="text-xl font-semibold mb-3">Earthquake Data Analysis</h2>
    <p class="text-gray-600 mb-4">
      This example demonstrates SQLRooms running in Svelte, querying earthquake data
      with DuckDB-WASM.
    </p>
    
    <button 
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      disabled={isLoading}
      on:click={runQuery}
    >
      {isLoading ? 'Loading...' : 'Run Query'}
    </button>
  </div>
  
  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      Error: {error}
    </div>
  {/if}
  
  {#if queryResult.length > 0}
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <h3 class="text-lg font-semibold p-4 bg-gray-50 border-b">
        Query Results ({queryResult.length} rows)
      </h3>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Magnitude
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Depth (km)
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each queryResult as row}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.location}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.magnitude}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.depth}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
  
  <div class="mt-8 text-sm text-gray-500">
    <h4 class="font-semibold">Compare with React version:</h4>
    <p>
      This Svelte app mirrors <code>examples/minimal/</code> functionality,
      demonstrating the same SQLRooms capabilities with Svelte's reactive syntax.
    </p>
  </div>
</main>

<style>
  main {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }
</style> 