import * as React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAllReadables, useAllActions } from "./copilotContext";

export function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const readables = useAllReadables();
  const actions = useAllActions();

  // 同步 readable/action 到后端
  useEffect(() => {
    axios.post("https://user-copilot-server-production.up.railway.app/sync", { readables, actions });
  }, [readables, actions]);

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
    setMessages((msgs) => [...msgs, "User: " + input]);
    const res = await axios.post("https://user-copilot-server-production.up.railway.app/chat", { message: input });
    if (res.data.toolCalls) {
      // 只处理第一个 toolCall
      const call = res.data.toolCalls[0];
      const { name, args } = call.functionCall;
      if (actionMap[name]) {
        const result = await actionMap[name](args);
        setMessages((msgs) => [...msgs, `AI called action: ${name}(${JSON.stringify(args)})`]);
        // 反馈结果给后端
        await axios.post("https://user-copilot-server-production.up.railway.app/action-result", { name, args, result });
      }
    } else {
      setMessages((msgs) => [...msgs, "AI: " + res.data.text]);
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
            <div className="copilot-chat-modal-header">Assistant</div>
            <div className="copilot-chat-modal-messages">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.startsWith("User:") ? "copilot-chat-message-user" : "copilot-chat-message-ai"}
                >
                  <span
                    className={
                      m.startsWith("User:") ? "copilot-chat-message-user-bubble" : "copilot-chat-message-ai-bubble"
                    }
                  >
                    {m.replace(/^User: /, "")}
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
