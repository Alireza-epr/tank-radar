<template>
  <footer class="footer">
    <div class="footer_scroll">
      <table class="footer_table">
        <thead>
          <tr class="footer_summary-row">
            <th colspan="4">
              {{ stations.length }} station{{
                stations.length === 1 ? "" : "s"
              }}
            </th>
          </tr>
          <tr>
            <th>Street</th>
            <th>Distance</th>
            <th>Lat</th>
            <th>Lon</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="4" class="footer_placeholder">Loading stations…</td>
          </tr>
          <tr v-else-if="error">
            <td
              colspan="4"
              class="footer_placeholder footer_placeholder--error"
            >
              {{ error }}
            </td>
          </tr>
          <tr v-else-if="stations.length === 0">
            <td colspan="4" class="footer_placeholder">
              No stations loaded yet.
            </td>
          </tr>
          <template v-else>
            <tr
              v-for="station in stations"
              :key="station.objectid"
              class="footer_row"
              :class="{
                'footer_row--selected': station.objectid === selectedStationId,
              }"
              @click="onSelectStation(station.objectid)"
            >
              <td>{{ station.street }}</td>
              <td>
                {{
                  station.distance !== undefined
                    ? `${station.distance.toFixed(2)} km`
                    : "—"
                }}
              </td>
              <td>{{ formatCoordinate(station.lat) }}</td>
              <td>{{ formatCoordinate(station.lon) }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStationStore } from "@/store/stationStore";
import { useAppStore } from "@/store/appStore";
import { useZustandStore } from "@/composables/useZustandStore";
import { formatCoordinate } from "@packages/utils";

export default defineComponent({
  name: "TheFooter",
  setup() {
    const stations = useZustandStore(
      useStationStore,
      (a_State) => a_State.stations,
    );
    const selectedStationId = useZustandStore(
      useStationStore,
      (a_State) => a_State.selectedStationId,
    );
    const isLoading = useZustandStore(
      useAppStore,
      (a_State) => a_State.isLoading,
    );
    const error = useZustandStore(useAppStore, (a_State) => a_State.error);

    const onSelectStation = (a_ObjectId: number) => {
      useStationStore
        .getState()
        .setSelectedStationId((prev) =>
          prev === a_ObjectId ? null : a_ObjectId,
        );
    };

    return {
      stations,
      selectedStationId,
      isLoading,
      error,
      onSelectStation,
      formatCoordinate,
    };
  },
});
</script>

<style scoped>
.footer {
  height: 12rem;
  flex-shrink: 0;
  background-color: #fff;
  border-top: 1px solid var(--color-border);
}

.footer_scroll {
  height: 100%;
  overflow-y: auto;
}

.footer_table {
  width: 100%;
  border-collapse: collapse;
}

.footer_table th,
.footer_table td {
  padding: 0.5rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.footer_summary-row th {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 2rem;
  padding: 0.375rem 1rem;
  background-color: var(--color-bg);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.footer_table thead tr:not(.footer_summary-row) th {
  position: sticky;
  top: 2rem;
  z-index: 1;
  background-color: #fff;
}

.footer_row {
  cursor: pointer;
}

.footer_row:hover {
  background-color: var(--color-bg);
}

.footer_row--selected {
  background-color: #ffe8cc;
}

.footer_placeholder {
  color: var(--color-text-muted);
  text-align: center;
}

.footer_placeholder--error {
  color: var(--color-danger);
}
</style>
