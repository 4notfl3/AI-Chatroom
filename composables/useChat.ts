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

const API_BASE = '/api'
const WS_URL = 'ws://120.26.54.176:8001/ws'

const username = ref('')
const userId = ref('')
const joined = ref(false)
const connected = ref(false)
const connecting = ref(false)

const activeTarget = ref<'broadcast' | 'llm'>('broadcast')
const selectedModel = ref('qwen3.6-plus')
const models = ref<Model[]>([])
const users = ref<User[]>([])
const messages = ref<ChatMessage[]>([])
const privateChatUser = ref<User | null>(null)
const error = ref('')

let ws: WebSocket | null = null
let currentStreamingMsg: ChatMessage | null = null
let connectTimer: ReturnType<typeof setTimeout> | null = null
const seenMsgKeys = new Set<string>()

function addMessage(msg: ChatMessage) {
  messages.value.push(msg)
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

async function fetchModels() {
  try {
    const res = await $fetch<{ models: Model[] }>(`${API_BASE}/models`)
    models.value = res.models || []
    if (models.value.length > 0 && models.value[0].model.length > 0) {
      selectedModel.value = models.value[0].model[0]
    }
  } catch {
    // ignore fetch error
  }
}

function connect() {
  if (connecting.value || connected.value) return
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
    ws!.send(JSON.stringify({ type: 'join', username: username.value }))
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    handleMessage(data)
  }

  ws.onclose = () => {
    if (connectTimer) { clearTimeout(connectTimer); connectTimer = null }
    const wasJoined = joined.value
    connected.value = false
    joined.value = false
    connecting.value = false
    if (wasJoined) {
      messages.value = []
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
      addMessage({
        id: genId(),
        type: 'system',
        content: '欢迎！你已加入聊天',
        time: data.time
      })
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
        })
      } else if (e === 'user.left' || e === 'user.leave') {
        addMessage({
          id: genId(),
          type: 'system',
          event: 'left',
          content: `${data.user?.username || data.content} left`,
          time: data.time
        })
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
        })
      } else if (data.target === 'user') {
        const isFromMe = data.from?.id === userId.value
        const toId = data.to?.id || ''
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
        })
        if (!isFromMe && data.from?.id && (!privateChatUser.value || privateChatUser.value.id !== data.from.id)) {
          privateChatUser.value = { id: data.from.id, username: data.from.username }
        }
      }
      break

    case 'llm.delta':
      if (!currentStreamingMsg) {
        currentStreamingMsg = {
          id: genId(),
          type: 'llm-delta',
          from: data.model || 'AI',
          content: data.content || '',
          time: new Date().toISOString(),
          streaming: true
        }
        addMessage(currentStreamingMsg)
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
      })
      break

    case 'error':
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
  addMessage({
    id: genId(),
    type: 'broadcast',
    from: username.value,
    fromId: userId.value,
    content,
    time: new Date().toISOString()
  })
  ws.send(JSON.stringify({
    type: 'chat',
    target: 'llm',
    model: selectedModel.value,
    content,
    api_key: apiKey
  }))
}

function disconnect() {
  if (ws && connected.value) {
    try {
      ws.send(JSON.stringify({ type: 'leave' }))
    } catch { /* ignore */ }
    ws.close()
  }
  ws = null
  connected.value = false
  joined.value = false
  messages.value = []
  users.value = []
  currentStreamingMsg = null
  privateChatUser.value = null
  activeTarget.value = 'broadcast'
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
    messages,
    privateChatUser,
    error,
    formatTime,
    fetchModels,
    connect,
    disconnect,
    sendBroadcast,
    sendPrivate,
    sendLLM
  }
}
