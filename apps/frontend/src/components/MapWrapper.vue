<template>
  <div
    ref="mapContainer"
    class="map-wrapper"
  />
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import { Map, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const COLOGNE_CENTER: [number, number] = [6.9603, 50.9375];
const DEFAULT_ZOOM = 10;

export default defineComponent({
  name: "MapWrapper",
  setup() {
    const mapContainer = ref<HTMLDivElement | null>(null);
    let map: Map | undefined;

    onMounted(() => {
      if (!mapContainer.value) return;

      map = new Map({
        container: mapContainer.value,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: COLOGNE_CENTER,
        zoom: DEFAULT_ZOOM,
      });

      map.addControl(new NavigationControl(), "top-right");
    });

    onUnmounted(() => {
      map?.remove();
    });

    return { mapContainer };
  },
});
</script>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
}
</style>
