import { ipcMain, shell } from "electron";
import { CodexUsageService } from "../services/codexUsageService";

/** Registers IPC handlers for token usage snapshots and local navigation. */
export const registerTokenIpc = (service: CodexUsageService, codexHome: string): void => {
  ipcMain.handle("usage:getSnapshot", () => service.getSnapshot());
  ipcMain.handle("usage:refresh", () => service.refresh());
  ipcMain.handle("app:openCodexHome", async () => {
    const result = await shell.openPath(codexHome);
    return result.length === 0;
  });
};
