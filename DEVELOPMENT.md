# 开发指南

## 快速更新代码

当你修改了 `user-copilot-ui` 的源码后，需要重新构建并更新 demo 项目。

### 方法一：使用脚本（推荐）

```bash
# 在 user-copilot-ui 目录下
./dev-script.sh
```

或者使用 npm script：

```bash
pnpm run dev:rebuild
```

### 方法二：自动监听模式

如果你想要自动监听文件变化：

```bash
# 安装 fswatch（如果还没有）
brew install fswatch

# 启动监听模式
pnpm run dev:watch
```

这样当你修改任何 `src/` 目录下的文件时，会自动重新构建并更新 demo。

### 方法三：手动步骤

如果脚本不工作，可以手动执行：

```bash
# 1. 重新构建
pnpm run build

# 2. 更新 demo 依赖
cd demo
pnpm install
cd ..
```

## 开发流程

1. **修改源码**：编辑 `src/` 目录下的文件
2. **重新构建**：运行 `./dev-script.sh`
3. **刷新浏览器**：如果 demo 正在运行，刷新页面查看效果
4. **重复**：继续修改和构建

## 注意事项

- 确保 demo 项目正在运行（`pnpm run dev`）
- 修改后需要刷新浏览器页面
- 如果遇到问题，检查控制台错误信息 