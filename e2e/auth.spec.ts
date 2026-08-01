import { expect, test } from "@playwright/test";

test("sign-up and sign-in present email/password prerequisites", async ({
  page,
}) => {
  await page.goto("/sign-up");
  await expect(
    page.getByRole("heading", { name: "Create your account" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Confirm password")).toBeVisible();

  await page.goto("/sign-in");
  await expect(
    page.getByRole("link", { name: "Forgot your password?" }),
  ).toBeVisible();
});

test("password recovery has a safe entry point", async ({ page }) => {
  await page.goto("/forgot-password");
  await expect(
    page.getByRole("heading", { name: "Reset your password" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send recovery email" }),
  ).toBeVisible();
});

test("protected pages redirect a missing or expired session to sign-in", async ({
  page,
}) => {
  await page.goto("/farms/00000000-0000-0000-0000-000000000000");
  await expect(page).toHaveURL(/\/sign-in\?next=/);
});

test.describe("authenticated session behavior", () => {
  test.skip(
    !process.env.PLAYWRIGHT_AUTH_STORAGE_STATE,
    "requires a prepared local authenticated session",
  );

  test.use({ storageState: process.env.PLAYWRIGHT_AUTH_STORAGE_STATE });

  test("sign-out ends the session", async ({ page }) => {
    await page.goto("/farms");
    await page.getByRole("button", { name: "Sign out" }).first().click();
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
