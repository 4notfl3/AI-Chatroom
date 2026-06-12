<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">聊天室</div>
      <div class="sidebar-user">{{ username }}</div>
    </div>

    <div class="sidebar-targets">
      <button
        class="target-btn"
        :class="{ active: activeTarget === 'broadcast' }"
        @click="activeTarget = 'broadcast'"
      >
        <span class="target-dot broadcast-dot"></span>
        <span>Public</span>
      </button>
      <button
        class="target-btn"
        :class="{ active: activeTarget === 'llm' }"
        @click="activeTarget = 'llm'"
      >
        <span class="target-dot llm-dot"></span>
        <span>AI Chat</span>
      </button>
    </div>

    <div v-if="activeTarget === 'llm'" class="model-selector">
      <label class="model-label">Model</label>
      <button class="model-trigger" @click="toggleModelMenu">
        <span>{{ selectedModel }}</span>
        <svg class="model-chevron" :class="{ open: showModelMenu }" width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="#86868b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <Teleport to="body">
        <div v-if="showModelMenu" class="model-overlay" @click="showModelMenu = false" />
        <Transition name="drop">
          <div v-if="showModelMenu" class="model-menu" :style="menuStyle">
            <template v-for="m in models" :key="m.provider">
              <div class="model-group-label">{{ m.provider }}</div>
              <button
                v-for="mod in m.model"
                :key="mod"
                class="model-option"
                :class="{ active: selectedModel === mod }"
                @click="selectModel(mod)"
              >
                {{ mod }}
              </button>
            </template>
          </div>
        </Transition>
      </Teleport>
    </div>

    <div class="sidebar-section">
      <div class="section-title">在线 — {{ users.length }}</div>
      <div class="user-list">
        <button
          v-for="u in users"
          :key="u.id"
          class="user-item"
          :class="{ active: privateChatUser?.id === u.id, self: u.id === userId }"
          @click="selectUser(u)"
        >
          <span class="user-avatar">{{ u.username[0] }}</span>
          <span class="user-name">{{ u.username }}</span>
          <span v-if="u.id === userId" class="user-you">you</span>
        </button>
        <p v-if="users.length === 0" class="no-users">No one online yet</p>
      </div>
    </div>

    <button class="leave-btn" @click="disconnect">退出聊天室</button>
  </aside>
</template>

<script setup lang="ts">
import { useChat } from '~/composables/useChat'

const chat = useChat()
const {
  username, userId, users, activeTarget, selectedModel,
  models, privateChatUser, disconnect
} = chat

const showModelMenu = ref(false)
const menuStyle = ref<Record<string, string>>({})

function selectModel(mod: string) {
  selectedModel.value = mod
  showModelMenu.value = false
}

function toggleModelMenu(e: MouseEvent) {
  const btn = e.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  menuStyle.value = {
    position: 'fixed',
    top: rect.bottom + 4 + 'px',
    left: rect.left + 'px',
    width: rect.width + 'px'
  }
  showModelMenu.value = !showModelMenu.value
}

function selectUser(u: { id: string; username: string }) {
  if (u.id === userId) return
  if (privateChatUser.value?.id === u.id) {
    privateChatUser.value = null
    activeTarget.value = 'broadcast'
  } else {
    privateChatUser.value = u
  }
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-width: 260px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-light);
}

.sidebar-header {
  padding: 20px 20px 16px;
}

.sidebar-logo {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;
  margin-bottom: 4px;
}

.sidebar-user {
  font-size: 13px;
  color: var(--text-secondary);
}

.sidebar-targets {
  padding: 0 12px;
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.target-btn {
  flex: 1;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: background 0.15s, color 0.15s;
}

.target-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.target-btn.active {
  background: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.target-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.broadcast-dot { background: var(--success); }
.llm-dot { background: var(--accent); }

.model-selector {
  padding: 0 12px;
  margin-bottom: 16px;
}

.model-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  padding-left: 4px;
}

.model-select {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2386868b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}

.model-select:focus {
  border-color: var(--accent);
}

.model-trigger {
  width: 100%;
  height: 36px;
  padding: 0 28px 0 10px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: var(--bg-primary);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color 0.15s;
  position: relative;
}

.model-trigger:hover {
  border-color: var(--border);
}

.model-chevron {
  position: absolute;
  right: 10px;
  transition: transform 0.2s;
}

.model-chevron.open {
  transform: rotate(180deg);
}

.model-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
}

.model-menu {
  position: fixed;
  z-index: 100;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 6px;
  max-height: 260px;
  overflow-y: auto;
}

.model-group-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-tertiary);
  padding: 6px 10px 2px;
}

.model-group-label:first-child {
  padding-top: 2px;
}

.model-option {
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-primary);
  transition: background 0.12s;
}

.model-option:hover {
  background: var(--bg-secondary);
}

.model-option.active {
  background: #e8f0fe;
  color: var(--accent);
  font-weight: 500;
}

.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.sidebar-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  padding: 0 20px 8px;
}

.user-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

.user-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-primary);
  transition: background 0.15s;
}

.user-item:hover {
  background: var(--bg-tertiary);
}

.user-item.active {
  background: #e8f0fe;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #1d1d1f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-you {
  font-size: 11px;
  color: var(--text-tertiary);
}

.no-users {
  font-size: 13px;
  color: var(--text-tertiary);
  padding: 8px 8px;
}

.leave-btn {
  margin: 12px;
  height: 36px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--danger);
  transition: background 0.15s;
}

.leave-btn:hover {
  background: rgba(255, 59, 48, 0.08);
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    min-width: unset;
    height: auto;
    max-height: 40vh;
    border-right: none;
    border-bottom: 1px solid var(--border-light);
  }
}
</style>
