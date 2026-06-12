# ChatRoom Frontend

NuxtJS 前端聊天室，连接后端 WebSocket 服务，支持多模型 AI 对话。

## 架构

```
qianduan/
├── app.vue                      # 入口，登录/聊天状态切换
├── nuxt.config.ts                # Nuxt 配置 + API 代理
├── package.json                  # 依赖声明
├── tsconfig.json
├── assets/
│   └── css/
│       └── main.css              # 全局样式
├── components/
│   ├── LoginPanel.vue            # 登录面板
│   ├── ChatSidebar.vue           # 侧边栏（广播/AI切换、模型选择、用户列表）
│   ├── ChatMain.vue              # 主聊天区
│   ├── ChatMessage.vue           # 消息卡片（系统/广播/私聊/AI流式）
│   └── ChatInput.vue             # 输入框 + API Key 折叠输入
└── composables/
    └── useChat.ts                # 单例状态：WebSocket + 聊天逻辑
```

## 技术栈

- **Nuxt 3** — Vue 3 全栈框架
- **WebSocket** — 原生浏览器 API，无第三方依赖
- **TypeScript** — 完整类型定义

## 通信协议

连接地址：`ws://120.26.54.176:8001/ws`

模型列表：`http://120.26.54.176:8001/models`

消息均为 JSON 格式，详见 `/通信协议设计.md`

## 功能

| 功能 | 说明 |
|------|------|
| 登录 | 输入用户名加入聊天室 |
| 广播消息 | 向所有在线用户发送消息 |
| 私聊 | 点击侧边栏用户进入私聊模式 |
| AI 对话 | 切换到 AI Chat 模式，选择模型，填入 API Key |
| 流式回复 | AI 回答实时流式展示 |
| 用户列表 | 实时显示在线用户 |

## 开发

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 生产构建
```

## 部署

构建输出在 `.output/`，可以直接运行：

```bash
node .output/server/index.mjs
```

或部署 `.output/public/` 到任意静态服务器（SPA 模式）。
