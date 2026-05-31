import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:5181";
const account = process.env.SMOKE_ACCOUNT || "admin@example.com";
const password = process.env.SMOKE_PASSWORD || "ChangeMe123!";

const requiredRoutes = [
  ["/dashboard", "脚手架总览"],
  ["/admin/users", "用户管理"],
  ["/admin/roles", "角色管理"],
  ["/admin/permissions", "权限字典"],
  ["/admin/settings", "系统设置"],
  ["/admin/audit-logs", "审计日志"],
  ["/admin/files", "文件管理"],
  ["/examples/table", "表格示例"],
];

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
});

try {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.fill("input[name=account]", account);
  await page.fill("input[name=password]", password);
  await page.click('button:has-text("登录")');
  await page.waitForURL("**/dashboard", { timeout: 10000 });

  for (const [path, marker] of requiredRoutes) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
    const body = await page.locator("body").innerText();
    if (!body.includes(marker)) {
      throw new Error(`Route ${path} did not render marker: ${marker}`);
    }
  }

  const unexpectedErrors = consoleErrors.filter(
    (message) => !message.includes("401"),
  );
  if (unexpectedErrors.length > 0) {
    throw new Error(`Console errors:\n${unexpectedErrors.join("\n")}`);
  }

  console.log(`Smoke passed: ${baseUrl}`);
} finally {
  await browser.close();
}
