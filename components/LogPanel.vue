<template>
  <Transition name="slide">
    <aside v-if="show" class="log-panel">
      <div class="log-header">
        <span>操作日志</span>
        <button class="log-close" @click="$emit('close')">×</button>
      </div>
      <div class="log-list" ref="listRef">
        <div v-for="e in logEntries" :key="e.id" class="log-line">{{ e.detail }}</div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { useChat } from '~/composables/useChat'

defineProps<{ show: boolean }>()
defineEmits<{ close: [] }>()

const { logEntries } = useChat()
const listRef = ref<HTMLElement>()

watch(() => logEntries.value.length, () => {
  nextTick(() => { if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight })
})
</script>

<style scoped>
.log-panel { width: 360px; min-width: 360px; height: 100%; display: flex; flex-direction: column; background: var(--bg-secondary); border-left: 1px solid var(--border-light); }
.log-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; font-size: 14px; font-weight: 600; color: var(--text-primary); border-bottom: 1px solid var(--border-light); }
.log-close { font-size: 20px; color: var(--text-tertiary); line-height: 1; }
.log-close:hover { color: var(--text-primary); }
.log-list { flex: 1; overflow-y: auto; padding: 8px 12px; }
.log-line { font-family: 'SF Mono', 'Consolas', monospace; font-size: 11px; line-height: 1.5; color: var(--text-secondary); padding: 2px 0; white-space: pre-wrap; word-break: break-all; border-bottom: 1px solid var(--border-light); }
.slide-enter-active, .slide-leave-active { transition: width 0.2s ease, min-width 0.2s ease, opacity 0.2s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { width: 0; min-width: 0; opacity: 0; }
</style>
