"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/**
 * 全局 React Query Provider
 * 使用 useState 确保每个客户端 session 只创建一个 QueryClient 实例
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5 分钟内数据视为新鲜，不重新请求
            staleTime: 5 * 60 * 1000,
            // 缓存保留 10 分钟
            gcTime: 10 * 60 * 1000,
            // 窗口聚焦时不自动重新获取（markets 数据不需要实时更新）
            refetchOnWindowFocus: false,
            // 失败重试 1 次
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
