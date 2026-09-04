import { expect, test } from '@playwright/test';

test('create a TSX37 ladder, validate, persist, and reopen', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New' }).click();
  await expect(page.getByTestId('project-name')).toHaveValue('Untitled');

  await page.getByRole('button', { name: 'NO contact' }).click();
  await page.getByTestId('cell-0-0-0').click();
  await page.getByTestId('cell-operand').fill('%I0.1');

  await page.getByRole('button', { name: 'Coil', exact: true }).click();
  await page.getByTestId('cell-0-11-0').click();
  await page.getByTestId('cell-operand').fill('%Q0.1');

  await expect(page.getByTestId('diagnostics')).not.toContainText('ERROR');
  await expect(page.getByTestId('cell-0-0-0')).toContainText('%I0.1');
  await expect(page.getByTestId('cell-0-11-0')).toContainText('%Q0.1');

  await page.reload();
  await expect(page.getByTestId('cell-0-0-0')).toContainText('%I0.1');
  await expect(page.getByTestId('cell-0-11-0')).toContainText('%Q0.1');
});
