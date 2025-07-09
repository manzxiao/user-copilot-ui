# user-copilot-ui

A React component library for chat/copilot UI, built with Vite, TypeScript, and Tailwind CSS.

## Features
- ⚡️ Vite library mode
- 🎨 Tailwind CSS styling
- 🧩 React context-based API
- 📦 TypeScript types included

## Installation

```bash
pnpm add user-copilot-ui
```

> 你需要在你的项目中自行配置 Tailwind CSS，否则组件样式无效。

## Tailwind CSS Setup

1. 安装依赖（如果还没装）
   ```bash
   pnpm add -D tailwindcss postcss autoprefixer
   pnpx tailwindcss init -p
   ```
2. 配置 `tailwind.config.js`：
   ```js
   module.exports = {
     content: [
       "./src/**/*.{js,jsx,ts,tsx}",
       "./node_modules/user-copilot-ui/dist/**/*.js"
     ],
     theme: { extend: {} },
     plugins: [],
   };
   ```
3. 在你的主项目入口引入 Tailwind 样式：
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

## Usage

```tsx
import { CopilotProvider, Chat, useCopilotAction, useCopilotReadable } from "user-copilot-ui";

function App() {
  return (
    <CopilotProvider>
      <Chat />
    </CopilotProvider>
  );
}
```

## Development

```bash
pnpm install
pnpm dev        # Start Vite dev server
pnpm build      # Build library
pnpm type-check # TypeScript type check
```

## Publish

```bash
pnpm build
pnpm publish --access public
```

---

MIT License 