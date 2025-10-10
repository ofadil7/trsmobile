import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

type TopBarContextType = {
  hideTopBar: boolean;
  setHideTopBar: Dispatch<SetStateAction<boolean>>;
};

const TopBarContext = createContext<TopBarContextType | undefined>(undefined);

export const TopBarProvider = ({ children }: { children: React.ReactNode }) => {
  const [hideTopBar, setHideTopBar] = useState(false);
  return (
    <TopBarContext.Provider value={{ hideTopBar, setHideTopBar }}>
      {children}
    </TopBarContext.Provider>
  );
};

export const useTopBar = () => {
  const context = useContext(TopBarContext);
  if (!context) throw new Error('useTopBar must be used within TopBarProvider');
  return context;
};
