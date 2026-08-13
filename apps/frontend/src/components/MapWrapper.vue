<template>
  <div
    ref="mapContainer"
    class="map-wrapper"
  />
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { Map, Marker, NavigationControl, Popup, type MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { COLOGNE_CENTER, DEFAULT_ZOOM } from "@/config/mapConfig";
import { createStationMarkerElement } from "@/config/markerIcons";
import { useStationStore } from "@/store/stationStore";
import { useMapStore } from "@/store/mapStore";
import { useZustandStore } from "@/composables/useZustandStore";
import type { ICenterPoint } from "@/types/generalTypes";
import type { IStationResult } from "@packages/types";

export default defineComponent({
  name: "MapWrapper",
  setup() {
    const mapContainer = ref<HTMLDivElement | null>(null);
    const stations = useZustandStore(useStationStore, (a_State) => a_State.stations);
    const selectedStationId = useZustandStore(useStationStore, (a_State) => a_State.selectedStationId);
    const centerPoint = useZustandStore(useMapStore, (a_State) => a_State.centerPoint);
    const isPickingCenter = useZustandStore(useMapStore, (a_State) => a_State.isPickingCenter);
    let map: Map | undefined;
    let markers: Marker[] = [];
    let centerMarker: Marker | undefined;

    const renderMarkers = (a_Stations: IStationResult[]) => {
      markers.forEach((marker) => marker.remove());
      markers = [];

      if (!map) return;

      for (const station of a_Stations) {
        const popup = new Popup({ offset: 20 }).setText(`${station.street} (${station.rawAddress})`);
        const isSelected = station.objectid === selectedStationId.value;
        const onMarkerClick = () => {
          useStationStore
            .getState()
            .setSelectedStationId((prev) => (prev === station.objectid ? null : station.objectid));
        };
        const marker = new Marker({ element: createStationMarkerElement(isSelected, onMarkerClick) })
          .setLngLat([station.lon, station.lat])
          .setPopup(popup)
          .addTo(map);
        markers.push(marker);
      }
    };

    const renderCenterMarker = (a_Point: ICenterPoint | null) => {
      centerMarker?.remove();
      centerMarker = undefined;

      if (!map || !a_Point) return;

      centerMarker = new Marker({color: "green"})
        .setLngLat([a_Point.lon, a_Point.lat])
        .addTo(map);
    };

    const applyPickingCursor = (a_IsPicking: boolean) => {
      const canvas = map?.getCanvas();
      if (canvas) canvas.style.cursor = a_IsPicking ? "crosshair" : "";
    };

    const onMapClick = (e: MapMouseEvent) => {
      if (!isPickingCenter.value) return;

      useMapStore.getState().setCenterPoint({ lat: e.lngLat.lat, lon: e.lngLat.lng });
      useMapStore.getState().setIsPickingCenter(false);
    };

    onMounted(() => {
      if (!mapContainer.value) return;

      map = new Map({
        container: mapContainer.value,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: COLOGNE_CENTER,
        zoom: DEFAULT_ZOOM,
      });

      map.addControl(new NavigationControl(), "top-right");
      map.on("click", onMapClick);

      renderMarkers(stations.value);
      renderCenterMarker(centerPoint.value);
      applyPickingCursor(isPickingCenter.value);
    });

    watch(stations, renderMarkers);
    watch(selectedStationId, () => renderMarkers(stations.value));
    watch(centerPoint, renderCenterMarker);
    watch(isPickingCenter, applyPickingCursor);

    onUnmounted(() => {
      markers.forEach((marker) => marker.remove());
      centerMarker?.remove();
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
