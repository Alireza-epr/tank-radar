<template>
  <header class="header">
    <div class="header__spacer" />
    <h1 class="header__title">
      Tank Radar
    </h1>
    <div class="header__actions">
      <!-- Wiring this to POST /api/sync is a later step - placeholder for now. -->
      <button
        type="button"
        class="header__sync-button"
      >
        Sync
      </button>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Header",
  setup() {
    return {};
  },
});
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 3.5rem;
  padding: 0 1rem;
  background-color: #fff;
  border-bottom: 1px solid var(--color-border);
}

/* Matches .header__actions' width so the title stays visually centered
   across the whole header, not just centered in the leftover space. */
.header__spacer {
  width: 5rem;
}

.header__title {
  flex: 1;
  margin: 0;
  text-align: center;
  font-size: 1.25rem;
}

.header__actions {
  width: 5rem;
  display: flex;
  justify-content: flex-end;
}

.header__sync-button {
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--color-text);
  background-color: #fff;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
}

.header__sync-button:hover {
  background-color: var(--color-bg);
}
</style>
