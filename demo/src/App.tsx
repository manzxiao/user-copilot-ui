import { CopilotProvider } from "user-copilot-ui";
import "user-copilot-ui/dist/copilot-chat.css";
import { Demo } from "./Demo";

function App() {
  return (
    <CopilotProvider>
      <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
        <h1 style={{ textAlign: "center", marginTop: 40 }}>user-copilot-ui Demo</h1>
        <p style={{ textAlign: "center", color: "#666" }}>右下角浮动按钮可体验 Copilot 聊天与语音输入</p>
        <Demo />
      </div>
    </CopilotProvider>
  );
}

export default App;
