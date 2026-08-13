<template>
  <div class="app">
    <TheHeader />
    <main class="app_main">
      <TheSidebar />
      <MapWrapper />
    </main>
    <TheFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TheHeader from "@/components/TheHeader.vue";
import TheSidebar from "@/components/TheSidebar.vue";
import MapWrapper from "@/components/MapWrapper.vue";
import TheFooter from "@/components/TheFooter.vue";

export default defineComponent({
  name: "App",
  components: { TheHeader, TheSidebar, MapWrapper, TheFooter },
  setup() {
    return {};
  },
});
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app_main {
  flex: 1;
  display: flex;
  min-height: 0;
}
</style>
