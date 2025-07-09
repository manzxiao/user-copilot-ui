import React, { createContext, useContext, useState, useEffect } from "react";

// Readable
const ReadableContext = createContext<any[]>([]);
const SetReadableContext = createContext<any>(() => {});

export function useCopilotReadable({ description, value }: { description: string; value: any }) {
  const setReadables = useContext(SetReadableContext);
  useEffect(() => {
    setReadables((prev: any[]) => [...prev, { description, value }]);
    return () => setReadables((prev: any[]) => prev.filter((r) => r.value !== value));
  }, [description, value]);
}

// Action
const ActionContext = createContext<any[]>([]);
const SetActionContext = createContext<any>(() => {});

export function useCopilotAction(action: any) {
  const setActions = useContext(SetActionContext);
  useEffect(() => {
    setActions((prev: any[]) => [...prev, action]);
    return () => setActions((prev: any[]) => prev.filter((a) => a !== action));
  }, [action]);
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
