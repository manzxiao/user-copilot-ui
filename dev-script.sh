#!/bin/bash

# 开发脚本：自动重新构建 user-copilot-ui 并更新 demo
echo "🔄 开始重新构建 user-copilot-ui..."

# 1. 重新构建 user-copilot-ui
echo "📦 构建 user-copilot-ui..."
cd /Users/dev/Desktop/user-copilot-ui
pnpm run build

if [ $? -eq 0 ]; then
    echo "✅ user-copilot-ui 构建成功"
else
    echo "❌ user-copilot-ui 构建失败"
    exit 1
fi

# 2. 强制更新 demo 依赖
echo "🔄 强制更新 demo 依赖..."
cd demo

# 检查是否有 --force 参数
if [[ "$1" == "--force" ]]; then
    echo "🧹 清理缓存并强制重新安装..."
    rm -rf node_modules pnpm-lock.yaml
fi

pnpm install

if [ $? -eq 0 ]; then
    echo "✅ demo 依赖更新成功"
else
    echo "❌ demo 依赖更新失败"
    exit 1
fi

echo "🎉 所有更新完成！"
echo "💡 提示：如果 demo 正在运行，请刷新浏览器页面"
echo "💡 如果还有问题，请运行: ./dev-script.sh --force" 