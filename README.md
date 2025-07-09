# user-copilot-ui 组件库

## 安装

```bash
pnpm add user-copilot-ui
# 或
npm install user-copilot-ui
```

## 快速开始

### 1. 在主入口引入 Provider 和样式

```tsx
import { CopilotProvider } from "user-copilot-ui";
import "user-copilot-ui/dist/copilot-chat.css";

<CopilotProvider>
  <App />
</CopilotProvider>
```

### 2. 在需要的地方引入 Chat 及 hooks

```tsx
import { Chat, useCopilotAction, useCopilotReadable } from "user-copilot-ui";

export const SearchFormCopilot = ({ form, onFinish, onClear }) => {
  // 示例：注册可读数据
  useCopilotReadable({
    description: "The all concepts data",
    value: concepts,
  });

  // 示例：注册 Copilot action
  useCopilotAction({
    name: "searchByFormFields",
    description: "Search items using any of the available form fields.",
    parameters: { ... },
    handler: async (args) => {
      // 你的业务逻辑
      onFinish();
    },
  });

  return <Chat />;
};
```

## API 说明

### CopilotProvider
- 必须包裹在应用根节点外层。
- 用于提供 Copilot 全局上下文。

### Chat
- 聊天弹窗组件，右下角浮动按钮，点击可展开。
- 支持与 Copilot 服务端交互。

### useCopilotReadable
- 注册可读数据，Copilot 可感知这些数据。
- 参数：
  - `description`: string，描述数据含义
  - `value`: any，实际数据

### useCopilotAction
- 注册可调用的 action，Copilot 可远程调用。
- 参数：
  - `name`: string，action 名称
  - `description`: string，action 描述
  - `parameters`: object，action 参数定义（JSON Schema 格式）
  - `handler`: function，action 处理函数

---

## 样式说明
- 样式文件为 `user-copilot-ui/dist/copilot-chat.css`，需在主项目入口引入。
- 所有样式均以 `.copilot-chat-` 前缀命名，避免全局污染。

---

如需更多用法或自定义，欢迎提 issue！
