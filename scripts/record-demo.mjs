import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const appUrl = process.env.DEMO_URL ?? "http://127.0.0.1:5173";
const chromePath =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDir = path.resolve("demo-output");

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 960 },
  recordVideo: {
    dir: outputDir,
    size: { width: 1440, height: 960 }
  }
});

const page = await context.newPage();
await page.goto(appUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

await page.getByRole("button", { name: "Review before execution" }).click();
await page.waitForTimeout(2600);

await page.getByRole("button", { name: "RWA risk update" }).click();
await page.waitForTimeout(800);
await page.getByRole("button", { name: "Review before execution" }).click();
await page.waitForTimeout(2600);

await page.getByRole("button", { name: "Unsafe agent action" }).click();
await page.waitForTimeout(800);
await page.getByRole("button", { name: "Review before execution" }).click();
await page.waitForTimeout(3200);

const video = page.video();
await context.close();
await browser.close();

const videoPath = await video.path();
const finalPath = path.join(outputDir, "casper-agentic-risk-sentinel-demo.webm");
await fs.copyFile(videoPath, finalPath);

console.log(finalPath);
