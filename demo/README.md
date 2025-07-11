# user-copilot-ui Demo

本项目为 [user-copilot-ui](https://github.com/manzxiao/user-copilot-ui) 组件库的演示项目，基于 Vite + React + TypeScript 搭建。

## 快速开始

1. 安装依赖

```bash
pnpm install
```

2. 启动开发服务器

```bash
pnpm run dev
```

3. 打开浏览器访问 [http://localhost:5173](http://localhost:5173)

## 主要功能演示

- 右下角浮动按钮可展开 Copilot 聊天窗口
- 支持文本输入与语音输入（需浏览器支持 Web Speech API）
- 已注册示例 readable：
  - 用户名（Alice）
  - 当前时间（页面加载时）
- 已注册示例 action：
  - `showAlert`：弹窗提示指定内容
  - `getCurrentTime`：返回当前时间

你可以在聊天窗口输入：
- “调用 showAlert 提示你好”
- “获取当前时间”

体验 Copilot 远程调用 action、读取数据等能力。

## 依赖
- React 19
- Vite 7
- user-copilot-ui（本地依赖）

## 相关链接
- 组件库源码：[user-copilot-ui 仓库](https://github.com/manzxiao/user-copilot-ui)
