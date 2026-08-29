import { chromium } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const htmlPath = path.join(rootDir, "KAVRI-Client-Testing-Guide.html");
const pdfPath = path.join(rootDir, "KAVRI-Client-Testing-Guide.pdf");
const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(fileUrl, { waitUntil: "networkidle" });
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
  preferCSSPageSize: true,
});
await browser.close();
console.log("PDF created:", pdfPath);
