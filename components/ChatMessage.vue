<template>
  <div class="message" :class="msgClass" :id="msg.id">
    <template v-if="msg.type === 'system'">
      <div class="system-msg">
        <span class="system-icon">{{ msg.event === 'left' ? '←' : '→' }}</span>
        <span>{{ msg.content }}</span>
        <span class="system-time">{{ formatTime(msg.time) }}</span>
      </div>
    </template>

    <template v-else-if="msg.type === 'broadcast'">
      <div class="broadcast-msg" :class="{ mine: msg.fromId === userId }">
        <div class="msg-avatar">{{ msg.from?.[0] }}</div>
        <div class="msg-body">
          <div class="msg-meta">
            <span class="msg-name">{{ msg.from }}</span>
            <span class="msg-time">{{ formatTime(msg.time) }}</span>
          </div>
          <div class="msg-bubble">{{ msg.content }}</div>
        </div>
      </div>
    </template>

    <template v-else-if="msg.type === 'private'">
      <div class="broadcast-msg" :class="{ mine: msg.fromId === userId }">
        <div class="msg-avatar">{{ msg.from?.[0] }}</div>
        <div class="msg-body">
          <div class="msg-meta">
            <span class="msg-name">{{ msg.from }} → {{ msg.to }}</span>
            <span class="msg-time">{{ formatTime(msg.time) }}</span>
          </div>
          <div class="msg-bubble private-bubble">{{ msg.content }}</div>
        </div>
      </div>
    </template>

    <template v-else-if="msg.type === 'llm-delta' || msg.streaming">
      <div class="llm-msg">
        <div class="msg-avatar ai-avatar">AI</div>
        <div class="msg-body">
          <div class="msg-meta">
            <span class="msg-name">{{ msg.from || 'AI' }}</span>
          </div>
          <div class="msg-bubble ai-bubble">
            {{ msg.content }}
            <span class="cursor" v-if="msg.streaming">|</span>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="msg.type === 'error'">
      <div class="error-msg">
        <span class="error-icon">!</span>
        <span>{{ msg.content }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '~/composables/useChat'
import { useChat } from '~/composables/useChat'

const props = defineProps<{
  msg: ChatMessage
}>()

const { userId, formatTime } = useChat()

const msgClass = computed(() => ({
  'msg-system': props.msg.type === 'system',
  'msg-broadcast': props.msg.type === 'broadcast' || props.msg.type === 'private',
  'msg-llm': props.msg.type === 'llm-delta' || props.msg.streaming,
  'msg-error': props.msg.type === 'error',
  'from-me': 'fromId' in props.msg && props.msg.fromId === userId.value
}))
</script>

<style scoped>
.message {
  padding: 2px 0;
}

.system-msg {
  text-align: center;
  font-size: 12px;
  color: var(--text-tertiary);
  padding: 6px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.system-icon {
  font-weight: 600;
}

.system-time {
  opacity: 0.6;
  font-size: 11px;
}

.broadcast-msg {
  display: flex;
  gap: 10px;
  padding: 4px 0;
}

.broadcast-msg.mine {
  flex-direction: row-reverse;
}

.broadcast-msg.mine .msg-body {
  align-items: flex-end;
}

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1d1d1f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.ai-avatar {
  background: linear-gradient(135deg, #0071e3, #5ac8fa);
  font-size: 10px;
}

.msg-body {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.msg-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.msg-name {
  font-size: 12px;
  font-weight: 500;
}

.msg-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.broadcast-msg.mine .msg-meta {
  flex-direction: row-reverse;
}

.msg-bubble {
  font-size: 14px;
  line-height: 1.5;
  padding: 8px 14px;
  border-radius: 16px;
  background: var(--bg-secondary);
  word-break: break-word;
}

.broadcast-msg.mine .msg-bubble {
  background: var(--accent);
  color: #fff;
}

.private-bubble {
  border: 1px solid var(--border-light);
}

.ai-bubble {
  background: transparent;
  padding-left: 0;
}

.cursor {
  animation: blink 0.8s infinite;
  color: var(--accent);
  font-weight: 300;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.llm-msg {
  display: flex;
  gap: 10px;
  padding: 4px 0;
}

.error-msg {
  text-align: center;
  font-size: 13px;
  color: var(--danger);
  padding: 6px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.error-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--danger);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}
</style>
