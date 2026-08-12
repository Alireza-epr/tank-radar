<template>
  <div class="app">
    <Header />
    <main class="app__main">
      <Sidebar />
      <MapWrapper />
    </main>
    <Footer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Header from "@/components/Header.vue";
import Sidebar from "@/components/Sidebar.vue";
import MapWrapper from "@/components/MapWrapper.vue";
import Footer from "@/components/Footer.vue";

export default defineComponent({
  name: "App",
  components: { Header, Sidebar, MapWrapper, Footer },
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

.app__main {
  flex: 1;
  display: flex;
  min-height: 0;
}
</style>
