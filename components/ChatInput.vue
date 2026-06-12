<template>
  <div class="input-area">
    <div v-if="privateChatUser" class="private-badge">
      <span>DM: {{ privateChatUser.username }}</span>
      <button class="badge-close" @click="switchTarget('broadcast')">×</button>
    </div>
    <form class="input-row" @submit.prevent="handleSend">
      <input
        v-if="activeTarget === 'llm'"
        v-model="apiKey"
        type="password"
        class="api-key-input"
        placeholder="Key"
        autocomplete="off"
      />
      <input
        ref="inputRef"
        v-model="text"
        class="chat-input"
        type="text"
        :placeholder="placeholder"
        maxlength="2000"
        autocomplete="off"
      />
      <button
        type="submit"
        class="send-btn"
        :disabled="!canSend"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 9L16 2L9 16L7.5 10.5L2 9Z" fill="currentColor"/>
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useChat } from '~/composables/useChat'

const chat = useChat()
const {
  activeTarget, privateChatUser, sendBroadcast, sendPrivate, sendLLM, switchTarget
} = chat

const text = ref('')
const apiKey = ref('')
const inputRef = ref<HTMLInputElement>()

const placeholder = computed(() => {
  if (activeTarget.value === 'llm') return '与AI发送一条信息…………'
  if (privateChatUser.value) return `Message ${privateChatUser.value.username}...`
  return '输入一条信息…………'
})

const canSend = computed(() => {
  if (activeTarget.value === 'llm') return text.value.trim() && apiKey.value.trim()
  return text.value.trim()
})

function handleSend() {
  const msg = text.value.trim()
  if (!msg) return

  if (activeTarget.value === 'llm') {
    sendLLM(msg, apiKey.value.trim())
  } else if (privateChatUser.value) {
    sendPrivate(privateChatUser.value.id, msg)
  } else {
    sendBroadcast(msg)
  }

  text.value = ''
  inputRef.value?.focus()
}
</script>

<style scoped>
.input-area {
  padding: 12px 20px 16px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-primary);
}

.private-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: var(--bg-secondary);
  border-radius: 100px;
  font-size: 12px;
  margin-bottom: 10px;
  color: var(--text-secondary);
}

.badge-close {
  font-size: 16px;
  color: var(--text-tertiary);
  line-height: 1;
}

.badge-close:hover {
  color: var(--text-primary);
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.api-key-input {
  width: 90px;
  height: 40px;
  padding: 0 10px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 12px;
  background: var(--bg-secondary);
  outline: none;
  flex-shrink: 0;
}

.api-key-input:focus {
  border-color: var(--accent);
}

.chat-input {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: 14px;
  background: var(--bg-secondary);
  outline: none;
  resize: none;
  line-height: 1.4;
}

.chat-input:focus {
  border-color: var(--accent);
  background: var(--bg-primary);
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.12);
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1d1d1f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.15s, transform 0.15s;
}

.send-btn:hover:not(:disabled) {
  opacity: 0.85;
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.25;
  cursor: default;
}

.send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .input-area { padding: 10px 12px 14px; }
  .api-key-input { width: 80px; font-size: 11px; }
  .chat-input { font-size: 13px; min-height: 38px; }
  .send-btn { width: 38px; height: 38px; }
}
</style>
