import { test, expect } from "@playwright/test";

test("Start button launches the game and timer appears", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.fill('input[type="number"]', "180");
  await page.click("text=Start Game");
  await expect(page.locator("text=Timer:")).toBeVisible();
});

test("Handle button works only after fixing issue", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.fill('input[type="number"]', "180");
  await page.click("text=Start Game");

  // wait for messages to appear
  await page.waitForTimeout(3000);

  const handleBtn = page.locator("button:has-text('Handle')");
  if (await handleBtn.count()) {
    // Listen for alert
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("You haven’t fixed the issue");
      await dialog.dismiss();
    });

    await handleBtn.first().click();
  }
});


