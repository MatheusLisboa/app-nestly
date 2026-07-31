import { expect, test } from "@playwright/test";
import { brand } from "../../config/brand";

test("home shell renders brand and dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Início|Nestly|Home/i);
  await expect(page.getByText(brand.name).first()).toBeVisible();
});
