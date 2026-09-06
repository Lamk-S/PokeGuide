import { test, expect } from "@playwright/test";

test.describe("Flujo Crítico: Battle Lab", () => {
  test("permite configurar atacante, defensor y recibir resultado", async ({ page }) => {
    await page.goto("/battle-lab");

    // WCAG 2.4.1: SkipLink debe existir y ser el primer foco
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /Saltar al contenido principal/i })).toBeFocused();

    // Interacción por roles, nunca por clases CSS
    await page.getByRole("combobox", { name: /Atacante/i }).click();
    await page.getByRole("option", { name: "Garchomp" }).click();

    await page.getByRole("combobox", { name: /Movimiento/i }).click();
    await page.getByRole("option", { name: /Earthquake/i }).click();

    await page.getByRole("combobox", { name: /Defensor/i }).click();
    await page.getByRole("option", { name: "Sylveon" }).click();

    await page.getByRole("button", { name: /Calcular Daño/i }).click();

    // Feedback: skeleton -> resultado (ver docs/ux.md y performance.md)
    const resultHeading = page.getByRole("heading", { name: /Resultado del Combate/i });
    await expect(resultHeading).toBeVisible({ timeout: 10000 });

    await expect(page.getByText(/Daño:/i)).toBeVisible();
    await expect(page.getByText(/%/)).toBeVisible(); // Porcentaje de vida
  });

  test("404 es accesible y ofrece salida", async ({ page }) => {
    await page.goto("/ruta-inexistente-pokeguide-xyz");
    await expect(page.getByRole("heading", { name: /404|Ruta no encontrada/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Volver al inicio/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Ir a la Pokédex/i })).toBeVisible();
  });
});