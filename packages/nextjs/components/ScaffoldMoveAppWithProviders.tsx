"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { ProgressBar } from "~~/components/scaffold-move/ProgressBar";
import { WalletProvider } from "~~/components/scaffold-move/WalletContext";
import { useGlobalState } from "~~/services/store/store";

const ScaffoldMoveApp = ({ children }: { children: React.ReactNode }) => {
  const [ControlComponent, setControlComponent] = useState<React.ComponentType | null>(null);
  const store = useGlobalState();
  const { account } = useWallet();
  useEffect(() => {
    if (account?.address) {
      console.log("Account address:", account.address);
      if(store.address !== "" && store.address !== account.address){
        window.location.reload();
      }
      if (store.address !== account.address) {
        store.setAddress(account.address);
      }
      // 添加加载状态避免重复导入
      if (!ControlComponent) {
        import("../components/emotion-apt/OperationControl").then(module => {
          setControlComponent(() => module.OperationControl);
        });
      }
    }
  }, [account?.address, store, ControlComponent]); // 添加所有相关依赖

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
      {ControlComponent && <ControlComponent />}
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldMoveAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ProgressBar />

      <WalletProvider>
        <ScaffoldMoveApp>{children}</ScaffoldMoveApp>
      </WalletProvider>
    </QueryClientProvider>
  );
};
