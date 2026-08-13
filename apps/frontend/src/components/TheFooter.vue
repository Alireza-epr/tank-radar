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
          <tr>
            <td
              colspan="5"
              class="footer_placeholder"
            >
              No stations loaded yet.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TheFooter",
  setup() {
    return {};
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
</style>
