import { expect, test } from "@playwright/test";

test.describe("farm tenancy journeys", () => {
  test.skip(
    !process.env.PLAYWRIGHT_AUTH_STORAGE_STATE,
    "requires a prepared local identity with fixture farm memberships",
  );

  test.use({ storageState: process.env.PLAYWRIGHT_AUTH_STORAGE_STATE });

  test("farm entry sends a member to an explicit farm route", async ({ page }) => {
    await page.goto("/farms");
    await expect(page).toHaveURL(/\/farms\/[0-9a-f-]{36}$/i);
  });

  test("an unauthorized farm URL reveals no protected farm content", async ({ page }) => {
    await page.goto("/farms/00000000-0000-0000-0000-000000000000");
    await expect(page.getByText(/workspace is ready/i)).toHaveCount(0);
  });

  test("farm switching remains usable at a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/farms");
    const switcher = page.getByRole("link", { name: /change farm/i });
    await expect(switcher).toBeVisible();
    await expect(switcher).toHaveCSS("min-height", "44px");
  });
});

test.describe("farm onboarding", () => {
  test.skip(
    !process.env.PLAYWRIGHT_NO_FARM_STORAGE_STATE,
    "requires a prepared local identity without farm memberships",
  );

  test.use({ storageState: process.env.PLAYWRIGHT_NO_FARM_STORAGE_STATE });

  test("a user without farms can create their first owner farm", async ({ page }) => {
    await page.goto("/farms");
    await expect(
      page.getByRole("heading", { name: "Create your first farm" }),
    ).toBeVisible();
    await page.getByLabel("Farm name").fill("E2E Foundation Farm");
    await page.getByRole("button", { name: "Create farm" }).click();
    await expect(page).toHaveURL(/\/farms\/[0-9a-f-]{36}$/i);
    await expect(page.getByText(/active owner/i)).toBeVisible();
  });
});
