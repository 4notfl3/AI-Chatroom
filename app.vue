<template>
  <div class="app-root">
    <template v-if="!joined">
      <LoginPanel />
    </template>
    <template v-else>
      <div class="chat-layout">
        <ChatSidebar />
        <ChatMain />
      </div>
      <TransitionGroup name="toast" tag="div" class="toast-stack">
        <button
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          @click="openToastChat(t)"
        >
          <div class="toast-from">{{ t.fromUser.username }}</div>
          <div class="toast-text">{{ t.content }}</div>
        </button>
      </TransitionGroup>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useChat } from '~/composables/useChat'

const chat = useChat()
const { joined, toasts, switchTarget } = chat

function openToastChat(t: { id: string; fromUser: { id: string; username: string } }) {
  switchTarget('user', t.fromUser)
}

onMounted(() => {
  chat.fetchModels()
})
</script>

<style scoped>
.app-root {
  height: 100%;
  display: flex;
  background: var(--bg-primary);
}

.chat-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .chat-layout {
    flex-direction: column;
  }

  .toast-stack {
    bottom: 12px;
    right: 12px;
    left: 12px;
    max-width: none;
  }
}

.toast-stack {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 200;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  max-width: 320px;
}

.toast {
  text-align: left;
  padding: 12px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: box-shadow 0.15s;
  max-width: 100%;
  overflow: hidden;
}

.toast:hover {
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
}

.toast-from {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.toast-text {
  font-size: 13px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
