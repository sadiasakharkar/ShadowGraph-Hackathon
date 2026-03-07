import { test, expect } from '@playwright/test';

test('landing page renders core hero copy', async ({ page }) => {
  await page.goto('http://127.0.0.1:3001');
  await expect(page.getByText('ShadowGraph')).toBeVisible();
});

test('dashboard demo mode renders deterministic label', async ({ page }) => {
  await page.goto('http://127.0.0.1:3001/dashboard?demo=1');
  await expect(page.getByText('Guided Demo Mode')).toBeVisible();
  await expect(page.getByText('Simulating Identity Scan')).toBeVisible();
});

