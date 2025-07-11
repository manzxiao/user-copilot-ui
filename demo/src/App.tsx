import { CopilotProvider } from "user-copilot-ui";
import "user-copilot-ui/dist/copilot-chat.css";
import { Demo } from "./Demo";

function App() {
  return (
    <CopilotProvider>
      <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
        <h1 style={{ textAlign: "center", marginTop: 40 }}>user-copilot-ui Demo</h1>
        <p style={{ textAlign: "center", color: "#666" }}>右下角浮动按钮可体验 Copilot 聊天</p>

        <Demo />
        <div style={{ textAlign: "center", color: "#888", marginTop: 16, fontSize: 14 }}>
          当前只支持 demo 中的两个 action（showAlert、getCurrentTime）
          <pre
            style={{
              background: "#f4f4f4",
              color: "#333",
              textAlign: "left",
              padding: 12,
              borderRadius: 6,
              margin: "12px auto",
              maxWidth: 600,
              fontSize: 13,
              overflowX: "auto",
            }}
          >
            {`
// 注册 action: 弹窗提示
useCopilotAction({
  name: "showAlert",
  description: "弹窗提示指定内容",
  parameters: {
    type: "object",
    properties: { message: { type: "string", description: "要提示的内容" } },
    required: ["message"],
  },
  handler: async ({ message }: { message: string }) => {
    alert(message);
    return "弹窗已显示";
  },
});

// 注册 action: 返回当前时间
useCopilotAction({
  name: "getCurrentTime",
  description: "获取当前时间",
  parameters: {},
  handler: async () => {
    return new Date().toLocaleString();
  },
});
`}
          </pre>
        </div>
      </div>
    </CopilotProvider>
  );
}

export default App;
