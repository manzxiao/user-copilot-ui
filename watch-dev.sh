#!/bin/bash

# Watch 开发脚本：监听文件变化并自动重新构建
echo "👀 开始监听 user-copilot-ui 文件变化..."

# 检查是否安装了 fswatch
if ! command -v fswatch &> /dev/null; then
    echo "❌ 需要安装 fswatch，请运行: brew install fswatch"
    exit 1
fi

# 监听 src 目录的变化
fswatch -o src/ | while read f; do
    echo "🔄 检测到文件变化，开始重新构建..."
    
    # 重新构建
    pnpm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ 构建成功"
        
        # 强制更新 demo 依赖
        cd demo
        rm -rf node_modules pnpm-lock.yaml
        pnpm install
        echo "✅ demo 依赖已强制更新"
        cd ..
    else
        echo "❌ 构建失败"
    fi
    
    echo "⏳ 等待下一次文件变化..."
done 