import { BrowserWindow, app } from "electron";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const smokeScreenshotPath = (): string | null => {
  const index = process.argv.indexOf("--smoke-test");
  if (index === -1) {
    return null;
  }

  return process.env.TOKEN_MONITOR_SMOKE_SCREENSHOT ?? path.join(process.cwd(), "artifacts", "smoke.png");
};

/** Creates the Electron window used by the token listener. */
export const createAppWindow = (): BrowserWindow => {
  const screenshotPath = smokeScreenshotPath();
  const window = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 960,
    minHeight: 640,
    show: screenshotPath === null,
    backgroundColor: "#f5f7fb",
    title: "Codex Token Listener",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  void window.loadFile(path.join(__dirname, "..", "..", "renderer", "index.html"));
  if (screenshotPath) {
    void captureSmokeScreenshot(window, screenshotPath);
  }

  return window;
};

/** Captures a smoke-test screenshot and exits the app. */
export const captureSmokeScreenshot = async (
  window: BrowserWindow,
  screenshotPath: string
): Promise<void> => {
  await new Promise<void>((resolve) => {
    window.webContents.once("did-finish-load", () => resolve());
  });
  await waitForRenderedApp(window);
  const image = await window.capturePage();
  mkdirSync(path.dirname(screenshotPath), { recursive: true });
  writeFileSync(screenshotPath, image.toPNG());
  app.quit();
};

const waitForRenderedApp = async (window: BrowserWindow): Promise<void> => {
  const deadline = Date.now() + 9000;
  while (Date.now() < deadline) {
    const text = await window.webContents.executeJavaScript("document.body.innerText", true);
    if (
      typeof text === "string" &&
      (text.includes("首次启动自检") || text.includes("监听中"))
    ) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }
};
