export interface Model {
  provider: string
  model: string[]
}

export interface User {
  id: string
  username: string
}

export interface ChatMessage {
  id: string
  type: 'system' | 'broadcast' | 'private' | 'llm-delta' | 'llm-done' | 'error'
  from?: string
  fromId?: string
  to?: string
  content: string
  time: string
  model?: string
  event?: string
  streaming?: boolean
}

const API_BASE = 'http://120.26.54.176:8001'
const WS_URL = 'ws://120.26.54.176:8001/ws'

const username = ref('')
const userId = ref('')
const joined = ref(false)
const connected = ref(false)
const connecting = ref(false)

const activeTarget = ref<'broadcast' | 'llm' | 'user'>('broadcast')
const selectedModel = ref('qwen3.6-plus')
const models = ref<Model[]>([])
const users = ref<User[]>([])
const privateChatUser = ref<User | null>(null)
const error = ref('')

export interface Toast {
  id: string
  fromUser: User
  content: string
}
const toasts = ref<Toast[]>([])

function addToast(fromUser: User, content: string) {
  const id = genId()
  toasts.value.push({ id, fromUser, content })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 5000)
}

function dismissToast(id: string) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

const messageBus = reactive<Record<string, ChatMessage[]>>({})

function bucketKey(): string {
  if (activeTarget.value === 'user' && privateChatUser.value) return 'user_' + privateChatUser.value.id
  return activeTarget.value
}

function currentMessages(): ChatMessage[] {
  const key = bucketKey()
  if (!messageBus[key]) messageBus[key] = []
  return messageBus[key]
}

function addMessage(msg: ChatMessage, toBucket?: string) {
  const key = toBucket || bucketKey()
  if (!messageBus[key]) messageBus[key] = []
  messageBus[key].push(msg)
  persistMessage(msg, key)
}

async function persistMessage(msg: ChatMessage, channel: string) {
  if (msg.type === 'llm-delta') return
  try {
    await $fetch('/api/messages', {
      method: 'POST',
      body: {
        channel,
        type: msg.type,
        from: msg.from,
        fromId: msg.fromId,
        to: msg.to,
        content: msg.content,
        time: msg.time,
        model: msg.model,
        event: msg.event,
        streaming: msg.streaming
      }
    })
  } catch { /* silence */ }
}

async function loadHistory(channel: string) {
  try {
    const msgs = await $fetch<ChatMessage[]>(`/api/messages?channel=${encodeURIComponent(channel)}`)
    if (msgs.length > 0) {
      if (!messageBus[channel]) messageBus[channel] = []
      messageBus[channel].length = 0
      messageBus[channel].push(...msgs)
    }
  } catch { /* silence */ }
}

function switchTarget(target: 'broadcast' | 'llm' | 'user', user?: User | null) {
  activeTarget.value = target
  if (target === 'user' && user) {
    privateChatUser.value = user
    loadHistory('user_' + user.id)
  } else if (target !== 'user') {
    privateChatUser.value = null
    loadHistory(target)
  }
}

let ws: WebSocket | null = null
let currentStreamingMsg: ChatMessage | null = null
let connectTimer: ReturnType<typeof setTimeout> | null = null
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectAttempts = 0
let intentionalLeave = false
const seenMsgKeys = new Set<string>()

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

async function fetchModels() {
  try {
    const res = await $fetch<{ models: Model[] }>('/api/models')
    models.value = res.models || []
    if (models.value.length > 0 && models.value[0].model.length > 0) {
      selectedModel.value = models.value[0].model[0]
    }
  } catch (e) {
    console.error('模型列表获取失败', e)
  }
}

function connect() {
  if (connecting.value || connected.value) return
  intentionalLeave = false
  error.value = ''
  connecting.value = true

  ws = new WebSocket(WS_URL)

  connectTimer = setTimeout(() => {
    if (ws && ws.readyState !== WebSocket.OPEN) {
      ws.close()
      connecting.value = false
      error.value = 'Connection timed out. Check network or server.'
    }
  }, 8000)

  ws.onopen = () => {
    if (connectTimer) { clearTimeout(connectTimer); connectTimer = null }
    connected.value = true
    connecting.value = false
    reconnectAttempts = 0
    ws!.send(JSON.stringify({ type: 'join', username: username.value }))

    if (heartbeatTimer) clearInterval(heartbeatTimer)
    heartbeatTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    handleMessage(data)
  }

  ws.onclose = () => {
    if (connectTimer) { clearTimeout(connectTimer); connectTimer = null }
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null }
    const wasJoined = joined.value
    connected.value = false
    joined.value = false
    connecting.value = false
    if (wasJoined && !intentionalLeave && reconnectAttempts < 10) {
      reconnectAttempts++
      const delay = Math.min(1000 * reconnectAttempts, 10000)
      reconnectTimer = setTimeout(() => connect(), delay)
      return
    }
    if (wasJoined) {
      joined.value = false
      Object.keys(messageBus).forEach(k => delete messageBus[k])
      users.value = []
      currentStreamingMsg = null
      privateChatUser.value = null
      activeTarget.value = 'broadcast'
    }
  }

  ws.onerror = () => {
    if (connectTimer) { clearTimeout(connectTimer); connectTimer = null }
    connecting.value = false
    error.value = 'Cannot connect to server. Check network.'
  }
}

function handleMessage(data: any) {
  switch (data.type) {
    case 'join.ok':
      userId.value = data.user_id
      username.value = data.username
      joined.value = true
      loadHistory('broadcast')
      addMessage({
        id: genId(),
        type: 'system',
        content: '欢迎！你已加入聊天',
        time: data.time
      }, 'broadcast')
      break

    case 'system': {
      const e = data.event
      if (e === 'user.joined') {
        addMessage({
          id: genId(),
          type: 'system',
          event: 'joined',
          content: `${data.user?.username || data.content} joined`,
          time: data.time
        }, 'broadcast')
      } else if (e === 'user.left' || e === 'user.leave') {
        addMessage({
          id: genId(),
          type: 'system',
          event: 'left',
          content: `${data.user?.username || data.content} left`,
          time: data.time
        }, 'broadcast')
        if (privateChatUser.value && data.user?.id === privateChatUser.value.id) {
          privateChatUser.value = null
        }
      }
      break
    }

    case 'users':
      users.value = data.users || []
      break

    case 'message':
      if (data.target === 'broadcast') {
        addMessage({
          id: genId(),
          type: 'broadcast',
          from: data.from?.username || 'Unknown',
          fromId: data.from?.id || '',
          content: data.content,
          time: data.time
        }, 'broadcast')
      } else if (data.target === 'user') {
        const isFromMe = data.from?.id === userId.value
        const toId = data.to?.id || ''
        const partnerId = isFromMe ? toId : (data.from?.id || '')
        const bucket = 'user_' + partnerId
        if (isFromMe && data.from?.id === toId) {
          const key = `${data.from?.id}|${toId}|${data.content}|${data.time}`
          if (seenMsgKeys.has(key)) { return }
          seenMsgKeys.add(key)
        }
        addMessage({
          id: genId(),
          type: 'private',
          from: data.from?.username || 'Unknown',
          fromId: data.from?.id || '',
          to: data.to?.username || 'Unknown',
          content: data.content,
          time: data.time
        }, bucket)
        if (!isFromMe && data.from?.id && (!privateChatUser.value || privateChatUser.value.id !== data.from.id)) {
          privateChatUser.value = { id: data.from.id, username: data.from.username }
        }
        if (!isFromMe && data.from?.id && data.from?.username &&
          (activeTarget.value !== 'user' || privateChatUser.value?.id !== data.from.id)) {
          addToast({ id: data.from.id, username: data.from.username }, data.content)
        }
      }
      break

    case 'llm.delta':
      if (!currentStreamingMsg) {
        const raw: ChatMessage = {
          id: genId(),
          type: 'llm-delta',
          from: data.model || 'AI',
          content: data.content || '',
          time: new Date().toISOString(),
          streaming: true
        }
        if (!messageBus['llm']) messageBus['llm'] = []
        messageBus['llm'].push(raw)
        currentStreamingMsg = messageBus['llm'][messageBus['llm'].length - 1]
      } else {
        currentStreamingMsg.content += data.content || ''
      }
      break

    case 'llm.done':
      if (currentStreamingMsg) {
        currentStreamingMsg.streaming = false
        currentStreamingMsg = null
      }
      addMessage({
        id: genId(),
        type: 'llm-done',
        from: data.model || 'AI',
        content: '',
        time: new Date().toISOString()
      }, 'llm')
      break

    case 'error':
      currentStreamingMsg = null
      error.value = data.message || 'An error occurred'
      if (data.code === 'USER_IS_TAKEN') {
        joined.value = false
        disconnect()
      }
      break
  }

  nextTick(() => {
    const el = document.getElementById('chat-messages')
    if (el) el.scrollTop = el.scrollHeight
  })
}

function sendBroadcast(content: string) {
  if (!ws || !joined.value) return
  ws.send(JSON.stringify({ type: 'chat', target: 'broadcast', content }))
}

function sendPrivate(toUserId: string, content: string) {
  if (!ws || !joined.value) return
  ws.send(JSON.stringify({ type: 'chat', target: 'user', to: toUserId, content }))
}

function sendLLM(content: string, apiKey: string) {
  if (!ws || !joined.value) return
  currentStreamingMsg = null
  addMessage({
    id: genId(),
    type: 'broadcast',
    from: username.value,
    fromId: userId.value,
    content,
    time: new Date().toISOString()
  }, 'llm')
  ws.send(JSON.stringify({
    type: 'chat',
    target: 'llm',
    model: selectedModel.value,
    content,
    api_key: apiKey
  }))
}

function disconnect() {
  intentionalLeave = true
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
  if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null }
  if (ws && connected.value) {
    try {
      ws.send(JSON.stringify({ type: 'leave' }))
    } catch { /* ignore */ }
    ws.close()
  }
  ws = null
  connected.value = false
  joined.value = false
  Object.keys(messageBus).forEach(k => delete messageBus[k])
  users.value = []
  currentStreamingMsg = null
  privateChatUser.value = null
  activeTarget.value = 'broadcast'
  toasts.value = []
}

export const useChat = () => {
  return {
    username,
    userId,
    joined,
    connected,
    connecting,
    activeTarget,
    selectedModel,
    models,
    users,
    currentMessages,
    privateChatUser,
    error,
    toasts,
    addToast,
    dismissToast,
    formatTime,
    fetchModels,
    connect,
    disconnect,
    switchTarget,
    sendBroadcast,
    sendPrivate,
    sendLLM
  }
}
