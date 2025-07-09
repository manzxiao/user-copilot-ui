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
      <div className="wonder-fixed wonder-bottom-6 wonder-right-6 wonder-z-50 wonder-flex wonder-flex-row wonder-items-end wonder-gap-4">
        {/* 聊天弹窗 */}
        {open && (
          <div className="wonder-bg-white wonder-rounded-2xl wonder-shadow-2xl wonder-w-\[450px\] wonder-max-w-\[90vw\] wonder-flex wonder-flex-col wonder-h-\[70vh\] wonder-relative wonder-animate-fade-in">
            <div className="wonder-px-6 wonder-pt-6 wonder-pb-2 wonder-text-lg wonder-font-semibold wonder-border-b wonder-border-gray-100">
              Assistant
            </div>
            <div className="wonder-flex-1 wonder-overflow-y-auto wonder-overflow-x-hidden wonder-px-6 wonder-py-4 wonder-space-y-2 wonder-text-sm">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.startsWith("User:") ? "wonder-text-right" : "wonder-text-left wonder-text-blue-700"}
                >
                  <span
                    className={
                      m.startsWith("User:")
                        ? "wonder-inline-block wonder-break-words wonder-max-w-full wonder-bg-gray-100 wonder-rounded-lg wonder-px-3 wonder-py-1"
                        : "wonder-inline-block wonder-break-words wonder-max-w-full wonder-bg-blue-50 wonder-rounded-lg wonder-px-3 wonder-py-1"
                    }
                  >
                    {m.replace(/^User: /, "")}
                  </span>
                </div>
              ))}
            </div>
            <form
              className="wonder-flex wonder-items-center wonder-gap-2 wonder-px-6 wonder-py-4 wonder-border-t wonder-border-gray-100 wonder-bg-white"
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                if (!sending && input.trim()) send();
              }}
            >
              <input
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                className="wonder-flex-1 wonder-px-3 wonder-py-2 wonder-border wonder-border-gray-200 wonder-rounded-lg wonder-focus:outline-none wonder-focus:ring-2 wonder-focus:ring-blue-400"
                placeholder="Type your question..."
                disabled={sending}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!sending && input.trim()) send();
                  }
                }}
              />
              <button
                type="submit"
                className="wonder-px-4 wonder-py-2 wonder-bg-blue-600 wonder-text-white wonder-rounded-lg wonder-font-medium wonder-hover:bg-blue-700 wonder-transition wonder-disabled:opacity-60 wonder-disabled:cursor-not-allowed"
                disabled={sending || !input.trim()}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
            <button
              className="wonder-absolute wonder-top-3 wonder-right-3 wonder-text-gray-400 wonder-hover:text-gray-700 wonder-text-xl wonder-font-bold wonder-focus:outline-none"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        {/* 浮动按钮始终显示 */}
        <button
          className={
            "wonder-bg-blue-600 wonder-hover:bg-blue-700 wonder-text-white wonder-rounded-full wonder-shadow-lg wonder-w-14 wonder-h-14 wonder-flex wonder-items-center wonder-justify-center wonder-text-2xl wonder-transition wonder-focus:outline-none wonder-border-4 " +
            (open ? "wonder-border-blue-200" : "wonder-border-transparent")
          }
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close Copilot Chat" : "Open Copilot Chat"}
          style={{ boxShadow: open ? "0 0 0 4px #3b82f6" : undefined }}
        >
          {open ? (
            <svg
              className="wonder-w-7 wonder-h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="wonder-w-7 wonder-h-7"
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
