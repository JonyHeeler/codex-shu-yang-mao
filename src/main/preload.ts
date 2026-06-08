import { contextBridge, ipcRenderer } from "electron";
import type { UsageSnapshot } from "@shared/tokenTypes";

/** Safely exposes the token monitor bridge to the renderer process. */
contextBridge.exposeInMainWorld("tokenMonitor", {
  getSnapshot: () => ipcRenderer.invoke("usage:getSnapshot"),
  refresh: () => ipcRenderer.invoke("usage:refresh"),
  openCodexHome: () => ipcRenderer.invoke("app:openCodexHome"),
  onSnapshot: (listener: (snapshot: UsageSnapshot) => void) => {
    const handler = (_: Electron.IpcRendererEvent, snapshot: UsageSnapshot) => listener(snapshot);
    ipcRenderer.on("usage:snapshot", handler);
    return () => ipcRenderer.off("usage:snapshot", handler);
  }
});
