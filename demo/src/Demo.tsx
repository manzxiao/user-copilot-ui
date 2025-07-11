import { Chat, useCopilotReadable, useCopilotAction } from "user-copilot-ui";
export function Demo() {
  useCopilotReadable({ description: "用户名", value: "Alice" });
  useCopilotReadable({ description: "当前时间", value: new Date().toLocaleString() });

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
  return <Chat />;
}
