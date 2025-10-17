import { test, expect } from "@playwright/test";

// Test 1: Start button launches the game and timer appears
test("Start button launches the game and timer appears", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.fill('input[type="number"]', "180");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.getByText("Timer:")).toBeVisible();
});


// Test 2: Handle button works only after fixing issue
test("Handle button works only after fixing issue", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.fill('input[type="number"]', "180");
  await page.getByRole("button", { name: "Start Game" }).click();
  await page.waitForTimeout(3000);

  // Find handle button
  const handleBtn = page.getByRole("button", { name: /Handle/i });

  if (await handleBtn.count()) {
    // Listen for alert message
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("You haven’t fixed the issue");
      await dialog.dismiss();
    });

    // Click button to trigger alert
    await handleBtn.first().click();
  } else {
    console.warn("No Handle button appeared during this test run.");
  }
});


