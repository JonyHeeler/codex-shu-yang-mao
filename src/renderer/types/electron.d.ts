import type { TokenMonitorBridge } from "@shared/tokenTypes";

declare global {
  interface Window {
    tokenMonitor: TokenMonitorBridge;
  }
}

export {};
