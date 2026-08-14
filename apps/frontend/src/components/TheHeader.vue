<template>
  <header class="header">
    <h1 class="header_title">Tank Radar</h1>

    <div class="header_actions">
      <div class="header_sync">
        <span
          v-if="sync?.status"
          class="header_status"
          :class="`header_status--${sync.status}`"
        >
          {{ sync.status }}
        </span>
        <button
          type="button"
          class="header_button"
          :disabled="isSyncing"
          @click="onSync"
        >
          {{ isSyncing ? "Syncing…" : "Sync" }}
        </button>
      </div>

      <div class="header_divider" />

      <div class="header_meta">
        <div class="header_meta-item">
          <span class="header_meta-label">Last Sync Try</span>
          <span class="header_meta-value">{{
            formatMetaDate(syncMeta?.latest?.finishedAt)
          }}</span>
        </div>
        <div class="header_meta-item">
          <span class="header_meta-label">Last Success</span>
          <span class="header_meta-value">{{
            formatMetaDate(syncMeta?.lastSuccess?.finishedAt)
          }}</span>
        </div>
        <button
          type="button"
          class="header_button header_button--ghost"
          :disabled="isFetchingMeta"
          @click="onSyncMeta"
        >
          {{ isFetchingMeta ? "Getting…" : "Get Meta" }}
        </button>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import {
  useSyncController,
  useSyncMetaController,
} from "@/controllers/syncController";
import type { ISyncMeta, ISyncRunInput } from "@packages/types";
import { formatLocalDateTime } from "@packages/utils";

export default defineComponent({
  name: "TheHeader",
  setup() {
    const sync = ref<ISyncRunInput>();
    const syncMeta = ref<ISyncMeta>();
    const isSyncing = ref(false);
    const isFetchingMeta = ref(false);

    const formatMetaDate = (a_Value: string | null | undefined) =>
      a_Value ? formatLocalDateTime(a_Value) : "—";

    const onSyncMeta = async () => {
      isFetchingMeta.value = true;
      try {
        const resp = await useSyncMetaController();
        if (!resp) {
          syncMeta.value = undefined;
        }

        if (resp?.entries) {
          syncMeta.value = resp.entries[0];
        }
      } finally {
        isFetchingMeta.value = false;
      }
    };

    const onSync = async () => {
      isSyncing.value = true;
      try {
        const resp = await useSyncController();
        if (!resp) {
          sync.value = {
            status: "failed",
          };
        }
        if (resp?.entries) {
          sync.value = resp.entries[0];
        }
      } finally {
        isSyncing.value = false;
        if (sync.value && sync.value.status !== "failed") await onSyncMeta();
      }
    };

    onMounted(onSync);

    return {
      onSync,
      onSyncMeta,
      sync,
      syncMeta,
      isSyncing,
      isFetchingMeta,
      formatMetaDate,
    };
  },
});
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 3.5rem;
  padding: 0.5rem 1rem;
  background-color: #fff;
  border-bottom: 1px solid var(--color-border);
}

.header_title {
  margin: 0;
  font-size: 1.25rem;
  white-space: nowrap;
}

.header_actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header_sync {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header_divider {
  width: 1px;
  height: 1.75rem;
  background-color: var(--color-border);
}

.header_meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header_meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  line-height: 1.2;
}

.header_meta-label {
  font-size: 0.6875rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.header_meta-value {
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.header_button {
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--color-text);
  background-color: #fff;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  white-space: nowrap;
}

.header_button:hover:not(:disabled) {
  background-color: var(--color-bg);
}

.header_button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.header_button--ghost {
  color: var(--color-text-muted);
}

.header_status {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  white-space: nowrap;
}

.header_status--success {
  color: var(--color-success);
  background-color: var(--color-success-bg);
}

.header_status--failed {
  color: var(--color-danger);
  background-color: var(--color-danger-bg);
}

.header_status--running {
  color: var(--color-warning);
  background-color: var(--color-warning-bg);
}
</style>
