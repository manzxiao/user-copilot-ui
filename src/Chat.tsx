import * as React from "react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAllReadables, useAllActions } from "./copilotContext";

// API配置
const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3001"
    : "https://user-copilot-server-production.up.railway.app";

interface Message {
  id: string;
  type: "user" | "ai" | "thinking";
  content: string;
  isStreaming?: boolean;
}

export function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(30); // 打字速度 (ms)
  const readables = useAllReadables();
  const actions = useAllActions();
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingQueueRef = useRef<string[]>([]);
  const isTypingRef = useRef(false);

  // 同步 readable/action 到后端 - 使用防抖避免频繁请求
  useEffect(() => {
    // 清除之前的定时器
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // 只有当 actions 有内容时才发送 sync
    if (actions.length > 0) {
      // 设置新的定时器，延迟 100ms 发送
      syncTimeoutRef.current = setTimeout(() => {
        console.log("Syncing data:", { readables, actions });
        axios.post(`${API_BASE_URL}/sync`, { readables, actions });
      }, 100);
    }

    // 清理函数
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [readables, actions]);

  // 打字机效果处理函数
  const processTypingQueue = React.useCallback(
    async (messageId: string) => {
      if (isTypingRef.current || typingQueueRef.current.length === 0) return;

      isTypingRef.current = true;

      while (typingQueueRef.current.length > 0) {
        const chunk = typingQueueRef.current.shift();
        if (chunk) {
          setMessages((msgs) =>
            msgs.map((msg) => (msg.id === messageId ? { ...msg, content: msg.content + chunk } : msg))
          );

          // 等待打字间隔
          await new Promise((resolve) => setTimeout(resolve, typingSpeed + Math.random() * 20));
        }
      }

      isTypingRef.current = false;
    },
    [typingSpeed]
  );

  // action handler map
  const actionMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    actions.forEach((a) => {
      map[a.name] = a.handler;
    });
    return map;
  }, [actions]);

  const send = async () => {
    if (sending || !input.trim()) return;

    setSending(true);
    const userMessage = input.trim();
    const messageId = Date.now().toString();

    // 添加用户消息
    setMessages((msgs) => [
      ...msgs,
      {
        id: messageId,
        type: "user",
        content: userMessage,
      },
    ]);

    // 添加thinking消息
    setMessages((msgs) => [
      ...msgs,
      {
        id: `thinking-${messageId}`,
        type: "thinking",
        content: "正在分析您的请求...",
      },
    ]);

    try {
      // 使用 fetch 进行 SSE 连接
      const response = await fetch(`${API_BASE_URL}/chat-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法读取响应流");
      }

      const decoder = new TextDecoder();
      let aiMessageId = `ai-${messageId}`;
      let isFirstContent = true;

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  return;
                }

                try {
                  const parsed = JSON.parse(data);

                  switch (parsed.type) {
                    case "thinking":
                      // 更新thinking消息
                      setMessages((msgs) =>
                        msgs.map((msg) =>
                          msg.id === `thinking-${messageId}` ? { ...msg, content: parsed.message } : msg
                        )
                      );
                      break;

                    case "content":
                      if (isFirstContent) {
                        // 移除thinking消息，添加AI消息
                        setMessages((msgs) => msgs.filter((msg) => msg.id !== `thinking-${messageId}`));
                        setMessages((msgs) => [
                          ...msgs,
                          {
                            id: aiMessageId,
                            type: "ai",
                            content: parsed.content,
                            isStreaming: true,
                          },
                        ]);
                        isFirstContent = false;
                      } else {
                        // 高级打字机效果：将内容加入队列
                        typingQueueRef.current.push(parsed.content);
                        processTypingQueue(aiMessageId);
                      }
                      break;

                    case "function_call":
                      // 移除thinking消息
                      setMessages((msgs) => msgs.filter((msg) => msg.id !== `thinking-${messageId}`));

                      // 添加函数调用消息
                      setMessages((msgs) => [
                        ...msgs,
                        {
                          id: aiMessageId,
                          type: "ai",
                          content: `正在执行操作: ${parsed.functionCall.name}`,
                        },
                      ]);

                      // 执行action
                      const { name, arguments: argsString = "{}" } = parsed.functionCall || {};

                      // 解析 arguments 字符串为对象
                      let parsedArgs = {};
                      try {
                        parsedArgs = JSON.parse(argsString);
                      } catch (parseError) {
                        console.error("解析 arguments 失败:", parseError);
                        parsedArgs = {};
                      }

                      if (actionMap[name]) {
                        try {
                          const result = await actionMap[name](parsedArgs);
                          setMessages((msgs) => [
                            ...msgs,
                            {
                              id: `result-${messageId}`,
                              type: "ai",
                              content: `操作完成: ${name}(${JSON.stringify(parsedArgs)})`,
                            },
                          ]);

                          // 反馈结果给后端
                          await axios.post(`${API_BASE_URL}/action-result`, {
                            name,
                            args: parsedArgs,
                            result,
                          });
                        } catch (error: any) {
                          setMessages((msgs) => [
                            ...msgs,
                            {
                              id: `error-${messageId}`,
                              type: "ai",
                              content: `操作失败: ${error.message}`,
                            },
                          ]);
                        }
                      }
                      return;
                      break;

                    case "complete":
                      // 完成流式响应
                      setMessages((msgs) =>
                        msgs.map((msg) => (msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg))
                      );
                      return;
                      break;

                    case "error":
                      setMessages((msgs) => [
                        ...msgs,
                        {
                          id: `error-${messageId}`,
                          type: "ai",
                          content: `错误: ${parsed.error}`,
                        },
                      ]);
                      return;
                      break;
                  }
                } catch (parseError) {
                  console.error("解析SSE数据失败:", parseError);
                }
              }
            }
          }
        } catch (streamError: any) {
          console.error("流处理错误:", streamError);
          setMessages((msgs) => [
            ...msgs,
            {
              id: `error-${messageId}`,
              type: "ai",
              content: `流处理错误: ${streamError.message}`,
            },
          ]);
        }
      };

      await processStream();
    } catch (error: any) {
      console.error("发送消息失败:", error);
      setMessages((msgs) => [
        ...msgs,
        {
          id: `error-${messageId}`,
          type: "ai",
          content: `发送失败: ${error.message}`,
        },
      ]);
    }

    setInput("");
    setSending(false);
  };

  return (
    <>
      {/* 固定右下角的按钮和弹窗容器 */}
      <div className="copilot-chat-fixed-container">
        {/* 聊天弹窗 */}
        {open && (
          <div className="copilot-chat-modal">
            <div className="copilot-chat-modal-header">
              Assistant
              <div className="typing-speed-control">
                <label>打字速度:</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={typingSpeed}
                  onChange={(e) => setTypingSpeed(Number(e.target.value))}
                  className="typing-speed-slider"
                />
                <span>{typingSpeed}ms</span>
              </div>
            </div>
            <div className="copilot-chat-modal-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.type === "user"
                      ? "copilot-chat-message-user"
                      : message.type === "thinking"
                      ? "copilot-chat-message-thinking"
                      : "copilot-chat-message-ai"
                  }
                >
                  <span
                    className={
                      message.type === "user"
                        ? "copilot-chat-message-user-bubble"
                        : message.type === "thinking"
                        ? "copilot-chat-message-thinking-bubble"
                        : "copilot-chat-message-ai-bubble"
                    }
                  >
                    {message.type === "thinking" && <span className="thinking-indicator">🤔 </span>}
                    {message.content}
                    {message.isStreaming && <span className="streaming-cursor">|</span>}
                  </span>
                </div>
              ))}
            </div>
            <form
              className="copilot-chat-modal-form"
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                if (!sending && input.trim()) send();
              }}
            >
              <input
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                className="copilot-chat-modal-input"
                placeholder="Type your question..."
                disabled={sending}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!sending && input.trim()) send();
                  }
                }}
              />
              <button type="submit" className="copilot-chat-modal-send-btn" disabled={sending || !input.trim()}>
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
            <button className="copilot-chat-modal-close" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </div>
        )}
        {/* 浮动按钮始终显示 */}
        <button
          className={"copilot-chat-fab " + (open ? "copilot-chat-fab-active" : "")}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close Copilot Chat" : "Open Copilot Chat"}
          style={{ boxShadow: open ? "0 0 0 4px #3b82f6" : undefined }}
        >
          {open ? (
            <svg
              className="copilot-chat-fab-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="copilot-chat-fab-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
