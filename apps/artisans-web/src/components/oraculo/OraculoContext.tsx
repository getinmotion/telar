import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OraculoContextValue {
  node: ReactNode;
  setNode: (n: ReactNode) => void;
  clearNode: () => void;
}

const OraculoContext = createContext<OraculoContextValue>({
  node: null,
  setNode: () => {},
  clearNode: () => {},
});

export const OraculoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [node, setNode] = useState<ReactNode>(null);
  const clearNode = () => setNode(null);
  return (
    <OraculoContext.Provider value={{ node, setNode, clearNode }}>
      {children}
    </OraculoContext.Provider>
  );
};

export function useOraculo() {
  return useContext(OraculoContext);
}
