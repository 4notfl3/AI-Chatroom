# ChatRoom

Nuxt 3 聊天室前端，支持广播、私聊、多模型 AI 对话、消息持久化。

## 架构

```
qianduan/
├── app.vue                           # 入口：登录/聊天 + 消息通知
├── nuxt.config.ts                    # Nuxt 配置 + API 代理（dev/prod）
├── package.json
├── tsconfig.json
├── .gitignore
├── assets/css/main.css               # Apple 黑白简洁风格全局样式
├── components/
│   ├── LoginPanel.vue                # 登录卡片
│   ├── ChatSidebar.vue               # 广播/AI/私聊切换 + 模型选择 + 在线用户
│   ├── ChatMain.vue                  # 消息列表
│   ├── ChatMessage.vue               # 消息渲染（系统/广播/私聊/AI流式/错误）
│   └── ChatInput.vue                 # 输入框 + AI Key 小输入
├── composables/
│   └── useChat.ts                    # 单例：WebSocket + 聊天 + 心跳 + 重连
└── server/
    ├── plugins/mongodb.ts            # MongoDB 连接（可选）
    ├── models/Message.ts             # 消息 Schema
    └── api/messages/
        ├── index.get.ts              # GET ?channel=xxx 加载历史
        └── index.post.ts             # POST 保存消息
```

## 技术栈

- **Nuxt 3** + Vue 3 + TypeScript
- **WebSocket** — 原生 API，无第三方依赖
- **MongoDB** + Mongoose — 消息持久化（可选）

## 后端接口

| 类型 | 地址 |
|------|------|
| 模型列表 | `http://120.26.54.176:8001/models` |
| WebSocket | `ws://120.26.54.176:8001/ws` |

模型请求走 Nuxt 代理 `/api/models`，避免浏览器 CORS。

## 功能

| 功能 | 说明 |
|------|------|
| 广播 | 向所有在线用户发送，消息持久化 |
| 私聊 | 点击在线用户进入独立对话，互不干扰 |
| AI 对话 | 多模型选择，真流式逐段输出 |
| 消息通知 | 非当前对话收到私聊时右下角弹窗 |
| 心跳保活 | 每 30s ping，断线自动重连 10 次 |
| 消息持久化 | MongoDB 可选，退出重进历史仍在 |

## 开发

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # 生产构建
```

## 部署

需要运行 Nuxt 服务器（代理模型 API + MongoDB）：

```bash
node .output/server/index.mjs
```

环境变量：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `MONGO_URI` | `mongodb://localhost:27017/chatroom` | MongoDB 地址，不设则消息不持久化 |


## 后端仓库
[AI-Chatroom-API](https://github.com/4notfl3/AI-Chatroom-API)
