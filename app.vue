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
    </template>
  </div>
</template>

<script setup lang="ts">
import { useChat } from '~/composables/useChat'

const chat = useChat()
const { joined } = chat

onMounted(() => {
  chat.fetchModels()
})
</script>

<style scoped>
.app-root {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}

.chat-layout {
  display: flex;
  width: 100%;
  height: 100%;
  max-width: 1200px;
}

@media (max-width: 768px) {
  .chat-layout {
    flex-direction: column;
  }
}
</style>
