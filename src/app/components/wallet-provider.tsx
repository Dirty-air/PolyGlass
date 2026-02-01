"use client";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import type { ReactNode } from "react";

import "@rainbow-me/rainbowkit/styles.css";

/**
 * 钱包连接 Provider
 * 包装 WagmiProvider 和 RainbowKitProvider
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: "#14b8a6", // teal-500
          accentColorForeground: "white",
          borderRadius: "medium",
        })}
      >
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
