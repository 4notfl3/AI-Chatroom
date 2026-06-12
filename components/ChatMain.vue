<template>
  <main class="main-panel">
    <div class="main-header">
      <h2 class="header-title">
        <template v-if="activeTarget === 'llm'">AI Chat</template>
        <template v-else-if="privateChatUser">@{{ privateChatUser.username }}</template>
        <template v-else>聊天室</template>
      </h2>
      <span v-if="activeTarget === 'llm'" class="model-badge">{{ selectedModel }}</span>
    </div>

    <div id="chat-messages" class="message-list">
      <ChatMessage v-for="msg in messages" :key="msg.id" :msg="msg" />
      <div v-if="messages.length === 0" class="empty-state">
        <p>No messages yet.</p>
        <p class="empty-hint">Send a message to get started.</p>
      </div>
    </div>

    <ChatInput />
  </main>
</template>

<script setup lang="ts">
import { useChat } from '~/composables/useChat'

const chat = useChat()
const { activeTarget, selectedModel, privateChatUser, messages } = chat
</script>

<style scoped>
.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
}

.main-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.model-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 100px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-weight: 500;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 6px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.empty-hint {
  font-size: 13px;
  opacity: 0.7;
}
</style>
