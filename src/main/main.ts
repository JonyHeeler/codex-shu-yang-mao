import { BrowserWindow, app } from "electron";
import { createAppWindow } from "./appWindow";
import { registerTokenIpc } from "./ipc/tokenIpc";
import { CodexUsageService } from "./services/codexUsageService";
import { resolveCodexHome } from "./utils/pathUtils";

const codexHome = resolveCodexHome();
const usageService = new CodexUsageService(codexHome);

/** Sends the latest usage snapshot to every open renderer window. */
const broadcastSnapshot = (): void => {
  const snapshot = usageService.getSnapshot();
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send("usage:snapshot", snapshot);
  }
};

app.whenReady().then(async () => {
  registerTokenIpc(usageService, codexHome);
  createAppWindow();
  await usageService.start(broadcastSnapshot);
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createAppWindow();
  }
});

app.on("window-all-closed", () => {
  usageService.stop();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
