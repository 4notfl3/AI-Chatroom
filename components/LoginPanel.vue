<template>
  <div class="login-panel">
    <div class="login-card">
      <div class="login-icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="12" fill="#1d1d1f"/>
          <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28C15.5817 28 12 24.4183 12 20Z" stroke="white" stroke-width="1.5"/>
          <path d="M13.5 24C14.8807 21.5949 17.2897 20 20 20C22.7103 20 25.1193 21.5949 26.5 24" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="17" cy="16" r="1.5" fill="white"/>
          <circle cx="23" cy="16" r="1.5" fill="white"/>
        </svg>
      </div>
      <h1 class="login-title">聊天室</h1>
      <p class="login-desc">联系 AI 与大众</p>
      <div class="login-form">
        <input
          v-model="name"
          class="login-input"
          type="text"
          placeholder="用户名称"
          maxlength="20"
          @keydown.enter="handleJoin"
        />
        <button
          class="login-btn"
          :disabled="!name.trim() || connecting"
          @click="handleJoin"
        >
          <span v-if="!connecting">进入 →</span>
          <span v-else class="spinner"></span>
        </button>
      </div>
      <p v-if="error" class="login-error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChat } from '~/composables/useChat'

const chat = useChat()
const { connecting, error } = chat
const name = ref('')

function handleJoin() {
  const n = name.value.trim()
  if (!n) return
  chat.username.value = n
  chat.connect()
}
</script>

<style scoped>
.login-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.login-card {
  text-align: center;
  max-width: 360px;
  width: 100%;
  padding: 40px 32px;
}

.login-icon {
  margin-bottom: 20px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.login-desc {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.login-form {
  display: flex;
  gap: 8px;
}

.login-input {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 15px;
  background: var(--bg-secondary);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.login-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
  background: var(--bg-primary);
}

.login-btn {
  height: 44px;
  padding: 0 20px;
  background: #1d1d1f;
  color: #fff;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.15s;
  white-space: nowrap;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.88;
}

.login-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.login-error {
  margin-top: 12px;
  font-size: 13px;
  color: var(--danger);
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
