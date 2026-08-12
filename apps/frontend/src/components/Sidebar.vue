<template>
  <aside class="sidebar">
    <p class="sidebar__placeholder">
      Filters (position, radius, search, sort) and the "get stations" button go here - not wired
      up yet.
    </p>
  </aside>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Sidebar",
  setup() {
    return {};
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

.sidebar__placeholder {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}
</style>
