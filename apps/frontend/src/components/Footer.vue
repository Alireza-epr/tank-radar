<template>
  <footer class="footer">
    <div class="footer__scroll">
      <table class="footer__table">
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
              class="footer__placeholder"
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
  name: "Footer",
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

.footer__scroll {
  height: 100%;
  overflow-y: auto;
}

.footer__table {
  width: 100%;
  border-collapse: collapse;
}

.footer__table th,
.footer__table td {
  padding: 0.5rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.footer__placeholder {
  color: var(--color-text-muted);
  text-align: center;
}
</style>
