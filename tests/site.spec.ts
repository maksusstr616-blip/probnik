import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test("page renders without runtime errors or horizontal overflow", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("На одной");
  const image = page.locator(".hero-photo img");
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  }
  expect(errors).toEqual([]);
});

test("stories open, advance and close with focus restored", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Читать историю «Алло, это ты?»" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Достаточно белого крокса");
  await dialog.getByRole("button", { name: "Следующая история" }).click();
  await expect(dialog).toContainText("Совпасть в несовпадении");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("portrait gallery switches between people", async ({ page }) => {
  await page.getByRole("button", { name: "Открыть портреты" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Она. Искра момента.");
  await dialog.getByRole("button", { name: "Следующий портрет" }).click();
  await expect(dialog).toContainText("Он. Тепло в ответ.");
  await dialog.getByRole("button", { name: "Закрыть" }).click();
  await expect(dialog).not.toBeVisible();
});

test("mood selection changes call response and traps focus", async ({ page }) => {
  await page.locator("#connect").getByRole("button", { name: "Посмеяться" }).click();
  await page.getByRole("button", { name: "Набрать нас" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Зато крокс заряжать не нужно");
  await dialog.getByRole("button", { name: "Помолчать" }).click();
  await expect(dialog).toContainText("Можно ничего не говорить");
  await dialog.getByRole("button", { name: "Закрыть" }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Оставить нам пару слов" })).toBeFocused();
});

test("guestbook saves locally and persists after reload", async ({ page }) => {
  await page.getByRole("button", { name: "Оставить послание", exact: true }).click();
  await page.getByLabel("Как к тебе обращаться?").fill("Гость");
  await page.getByLabel("Твоё послание").fill("Классная история, оставайтесь на одной волне!");
  await page.getByRole("button", { name: "Сохранить послание" }).click();
  await expect(page.getByRole("dialog")).toContainText("Твоё послание уже");
  await page.getByRole("button", { name: "Вернуться в журнал" }).click();
  await page.reload();
  await expect(page.locator(".note-card")).toContainText("Классная история");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("duo-notes")!)[0].name)).toBe("Гость");
});

test("sound and heart controls toggle", async ({ page }) => {
  const sound = page.getByRole("button", { name: "ЗВУК ВЫКЛ" });
  await sound.click();
  await expect(page.getByRole("button", { name: "ЗВУК ВКЛ" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "ЗВУК ВКЛ" }).click();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Отправить сердечко" }).click();
  await expect(page.getByRole("button", { name: "И мы тебя ♡" })).toHaveAttribute("aria-pressed", "true");
});

test("navigation works on current viewport", async ({ page }, testInfo) => {
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Открыть меню" }).click();
    await expect(page.getByRole("button", { name: "Закрыть меню" })).toHaveAttribute("aria-expanded", "true");
    await page.locator("#mobile-nav").getByRole("link", { name: "Истории" }).click();
    await expect(page.locator("#mobile-nav")).not.toBeVisible();
  } else {
    await page.getByRole("navigation", { name: "Основная навигация" }).getByRole("link", { name: "Истории" }).click();
  }
  await expect(page).toHaveURL(/#stories$/);
});

test("reduced motion respects system setting", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.locator(".ticker-track").evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  expect(errors).toEqual([]);
});
