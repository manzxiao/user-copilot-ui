import React, { createContext, useContext, useState, useEffect, useRef } from "react";

// Readable
const ReadableContext = createContext<any[]>([]);
const SetReadableContext = createContext<any>(() => {});

export function useCopilotReadable({ description, value }: { description: string; value: any }) {
  const setReadables = useContext(SetReadableContext);
  useEffect(() => {
    setReadables((prev: any[]) => {
      // 移除同描述的旧 readable
      const filtered = prev.filter((r) => r.description !== description);
      // 添加新的 readable
      return [...filtered, { description, value }];
    });
    return () => setReadables((prev: any[]) => prev.filter((r) => r.description !== description));
  }, [description, JSON.stringify(value)]); // 使用 JSON.stringify 来比较值的变化
}

// Action
const ActionContext = createContext<any[]>([]);
const SetActionContext = createContext<any>(() => {});

export function useCopilotAction(action: any) {
  const setActions = useContext(SetActionContext);
  const actionRef = useRef(action);

  // 更新 ref 以保持最新的 action
  actionRef.current = action;

  useEffect(() => {
    const currentAction = actionRef.current;
    setActions((prev: any[]) => {
      // 移除同名的旧 action
      const filtered = prev.filter((a) => a.name !== currentAction.name);
      // 添加新的 action
      return [...filtered, currentAction];
    });

    return () => {
      setActions((prev: any[]) => prev.filter((a) => a.name !== currentAction.name));
    };
  }, [action.name]); // 只依赖 action.name，这样更稳定
}

// Provider
export function CopilotProvider({ children }: { children: React.ReactNode }) {
  const [readables, setReadables] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  return (
    <ReadableContext.Provider value={readables}>
      <SetReadableContext.Provider value={setReadables}>
        <ActionContext.Provider value={actions}>
          <SetActionContext.Provider value={setActions}>{children}</SetActionContext.Provider>
        </ActionContext.Provider>
      </SetReadableContext.Provider>
    </ReadableContext.Provider>
  );
}

export function useAllReadables() {
  return useContext(ReadableContext);
}
export function useAllActions() {
  return useContext(ActionContext);
}
