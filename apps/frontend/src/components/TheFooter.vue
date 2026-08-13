<template>
  <footer class="footer">
    <div class="footer_scroll">
      <table class="footer_table">
        <thead>
          <tr>
            <th>Street</th>
            <th>Address</th>
            <th>Distance</th>
            <th>Lat</th>
            <th>Lon</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td
              colspan="5"
              class="footer_placeholder"
            >
              Loading stations…
            </td>
          </tr>
          <tr v-else-if="error">
            <td
              colspan="5"
              class="footer_placeholder footer_placeholder--error"
            >
              {{ error }}
            </td>
          </tr>
          <tr v-else-if="stations.length === 0">
            <td
              colspan="5"
              class="footer_placeholder"
            >
              No stations loaded yet.
            </td>
          </tr>
          <template v-else>
            <tr
              v-for="station in stations"
              :key="station.objectid"
            >
              <td>{{ station.street }}</td>
              <td>{{ station.rawAddress }}</td>
              <td>{{ station.distance !== undefined ? `${station.distance.toFixed(2)} km` : "—" }}</td>
              <td>{{ station.lat.toFixed(5) }}</td>
              <td>{{ station.lon.toFixed(5) }}</td>
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

export default defineComponent({
  name: "TheFooter",
  setup() {
    const stations = useZustandStore(useStationStore, (a_State) => a_State.stations);
    const isLoading = useZustandStore(useAppStore, (a_State) => a_State.isLoading);
    const error = useZustandStore(useAppStore, (a_State) => a_State.error);

    return { stations, isLoading, error };
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

.footer_placeholder {
  color: var(--color-text-muted);
  text-align: center;
}

.footer_placeholder--error {
  color: var(--color-danger);
}
</style>
