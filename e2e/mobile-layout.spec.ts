import { expect, test, type Page } from "@playwright/test";

const DASHBOARD_ROUTES = [
  "/dashboard/onboarding",
  "/dashboard",
  "/dashboard/properties",
  "/dashboard/tenants",
  "/dashboard/payments",
  "/dashboard/maintenance",
  "/dashboard/settings",
] as const;

async function enableE2EAuth(page: Page) {
  await page.context().addCookies([
    {
      name: "e2e-auth",
      value: "1",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
}

async function assertNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
}

async function assertMainAlignedToViewport(page: Page) {
  const main = page.locator("main").first();
  await expect(main).toBeVisible();
  const box = await main.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeLessThan(32);
}

test.beforeEach(async ({ page }) => {
  await enableE2EAuth(page);
});

for (const route of DASHBOARD_ROUTES) {
  test(`mobile layout has no horizontal shift on ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main").first()).toBeVisible();
    await assertNoHorizontalOverflow(page);
    await assertMainAlignedToViewport(page);
  });
}

test("Quick Setup shows wizard content and opens sidebar on mobile", async ({ page }) => {
  await page.goto("/dashboard/onboarding", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: /Quick Setup/i }).first()).toBeVisible();
  await expect(page.getByText(/Create your first property/i).first()).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await assertMainAlignedToViewport(page);

  await page.getByRole("button", { name: "Open sidebar" }).click();
  await expect(page.getByRole("button", { name: "Close sidebar overlay" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close sidebar" })).toBeVisible();
});
