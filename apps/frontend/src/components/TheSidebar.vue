<template>
  <aside class="sidebar">
    <form
      class="sidebar_form"
      @submit.prevent="onSubmit"
    >
      <div class="sidebar_field">
        <label
          class="sidebar_label"
          for="search"
        >Search street</label>
        <input
          id="search"
          v-model="search"
          type="text"
          class="sidebar_input"
          placeholder="e.g. Hauptstraße"
        >
      </div>

      <div class="sidebar_field">
        <span class="sidebar_label">Search center</span>
        <button
          type="button"
          class="sidebar_button"
          :class="{ 'sidebar_button--active': isPickingCenter }"
          @click="onTogglePicking"
        >
          {{ isPickingCenter ? "Click the map…" : "Pick Location on Map" }}
        </button>
        <div
          v-if="centerPoint"
          class="sidebar_center-point"
        >
          <span>{{ centerPoint.lat.toFixed(5) }}, {{ centerPoint.lon.toFixed(5) }}</span>
          <button
            type="button"
            class="sidebar_clear"
            @click="onClearCenter"
          >
            Clear
          </button>
        </div>
      </div>

      <div class="sidebar_field">
        <label
          class="sidebar_label"
          for="radius"
        >Radius around picked point</label>
        <select
          id="radius"
          v-model="radius"
          class="sidebar_select"
          :disabled="!centerPoint"
        >
          <option value="">
            No radius filter
          </option>
          <option
            v-for="option in RADIUS_OPTIONS"
            :key="option"
            :value="option"
          >
            {{ option }} km
          </option>
        </select>
        <span
          v-if="!centerPoint"
          class="sidebar_hint"
        >Pick a location on the map to enable this.</span>
      </div>

      <div class="sidebar_field">
        <label
          class="sidebar_label"
          for="sortBy"
        >Sort by</label>
        <select
          id="sortBy"
          v-model="sortBy"
          class="sidebar_select"
        >
          <option value="street">
            Street
          </option>
          <option
            value="distance"
            :disabled="!centerPoint"
          >
            Distance
          </option>
        </select>
      </div>

      <div class="sidebar_field">
        <label
          class="sidebar_label"
          for="sortDir"
        >Sort direction</label>
        <select
          id="sortDir"
          v-model="sortDir"
          class="sidebar_select"
        >
          <option value="asc">
            Ascending
          </option>
          <option value="desc">
            Descending
          </option>
        </select>
      </div>

      <button
        type="submit"
        class="sidebar_button"
        :disabled="isLoading"
      >
        {{ isLoading ? "Loading…" : "Get Stations" }}
      </button>

      <p
        v-if="error"
        class="sidebar_error"
      >
        {{ error }}
      </p>
    </form>
  </aside>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useStationsController } from "@/controllers/stationController";
import { useStationStore } from "@/store/stationStore";
import { useAppStore } from "@/store/appStore";
import { useMapStore } from "@/store/mapStore";
import { useZustandStore } from "@/composables/useZustandStore";
import type { TRadius, TSortBy, TSortDir } from "@packages/types";

const RADIUS_OPTIONS: TRadius[] = [2, 5, 10];

export default defineComponent({
  name: "TheSidebar",
  setup() {
    const initialFilters = useStationStore.getState().filters;
    const initialCenterPoint = useMapStore.getState().centerPoint;

    const search = ref(initialFilters.search ?? "");
    const radius = ref<"" | TRadius>(initialCenterPoint ? (initialFilters.radius ?? "") : "");
    const sortBy = ref<TSortBy>(initialCenterPoint ? (initialFilters.sortBy ?? "street") : "street");
    const sortDir = ref<TSortDir>(initialFilters.sortDir ?? "asc");

    const isLoading = useZustandStore(useAppStore, (a_State) => a_State.isLoading);
    const error = useZustandStore(useAppStore, (a_State) => a_State.error);
    const centerPoint = useZustandStore(useMapStore, (a_State) => a_State.centerPoint);
    const isPickingCenter = useZustandStore(useMapStore, (a_State) => a_State.isPickingCenter);

    watch(centerPoint, (a_Point) => {
      if (a_Point) return;
      radius.value = "";
      if (sortBy.value === "distance") sortBy.value = "street";
    });

    const onTogglePicking = () => {
      useMapStore.getState().setIsPickingCenter((prev) => !prev);
    };

    const onClearCenter = () => {
      useMapStore.getState().setCenterPoint(null);
    };

    const onSubmit = async () => {
      const trimmedSearch = search.value.trim();
      const point = centerPoint.value;
      const effectiveRadius = point !== null && radius.value !== "" ? radius.value : undefined;
      const effectiveSortBy: TSortBy = point !== null ? sortBy.value : "street";

      const filters = {
        search: trimmedSearch || undefined,
        radius: effectiveRadius,
        sortBy: effectiveSortBy,
        sortDir: sortDir.value,
      };
      useStationStore.getState().setFilters(filters);

      useAppStore.getState().setIsLoading(true);
      useAppStore.getState().setError(null);

      try {
        const resp = await useStationsController({
          ...filters,
          lat: point?.lat,
          lon: point?.lon,
        });

        if (!resp?.success) {
          useStationStore.getState().setStations([]);
          useAppStore.getState().setError("Failed to load stations.");
          return;
        }

        useStationStore.getState().setStations(resp.entries ?? []);
      } finally {
        useAppStore.getState().setIsLoading(false);
      }
    };

    return {
      search,
      radius,
      sortBy,
      sortDir,
      isLoading,
      error,
      centerPoint,
      isPickingCenter,
      onTogglePicking,
      onClearCenter,
      onSubmit,
      RADIUS_OPTIONS,
    };
  },
});
</script>

<style scoped>
.sidebar {
  width: 18rem;
  flex-shrink: 0;
  padding: 1rem;
  background-color: #fff;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

.sidebar_form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar_field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.sidebar_label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.sidebar_hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.sidebar_input,
.sidebar_select {
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--color-text);
  background-color: #fff;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  padding: 0.375rem 0.5rem;
}

.sidebar_select:disabled {
  color: var(--color-text-muted);
  background-color: var(--color-bg);
  cursor: not-allowed;
}

.sidebar_button {
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--color-text);
  background-color: #fff;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
}

.sidebar_button:hover:not(:disabled) {
  background-color: var(--color-bg);
}

.sidebar_button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sidebar_button--active {
  color: #2563eb;
  border-color: #2563eb;
}

.sidebar_center-point {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
}

.sidebar_clear {
  font-family: inherit;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
}

.sidebar_error {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-danger);
  background-color: var(--color-danger-bg);
  border-radius: 0.375rem;
  padding: 0.5rem;
}
</style>
