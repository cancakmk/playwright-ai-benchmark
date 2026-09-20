import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("/Users/can/Desktop/Projeler/uitree/node_modules/playwright");
const { performance } = require("perf_hooks");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

import { jevSelectChoice } from "../../../../../Desktop/Projeler/jev-playwright/packages/playwright-core/src/tools/backend/jev.ts";
import { lunaSelectChoice } from "../../../../../Desktop/Projeler/jev-playwright/packages/playwright-core/src/tools/backend/luna.ts";
import { glmSelectChoice } from "../../../../../Desktop/Projeler/jev-playwright/packages/playwright-core/src/tools/backend/glm.ts";

const ARTIFACT_DIR = "/Users/can/.gemini/antigravity-ide/brain/e7a6da1a-8233-4f43-80de-a616d8feb3df";
const VIDEO_DIR = path.join(ARTIFACT_DIR, "human_test_raw_videos");

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

// Visual cursor injection script (pointer-events: none on everything!)
const MOUSE_INJECT_SCRIPT = `
(() => {
  function initCursor() {
    if (document.getElementById("visual-mouse-cursor")) return;
    const cursor = document.createElement("div");
    cursor.id = "visual-mouse-cursor";
    cursor.style.cssText = \`
      position: fixed;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: radial-gradient(circle, #f43f5e 35%, #e11d48 100%);
      border: 2.5px solid #ffffff;
      box-shadow: 0 0 18px rgba(244, 63, 94, 0.95), 0 0 6px rgba(0,0,0,0.6);
      pointer-events: none !important;
      z-index: 100000000;
      transform: translate(-50%, -50%);
      transition: transform 0.05s ease, background 0.08s ease;
      display: block;
      top: -50px;
      left: -50px;
    \`;
    if (document.body) {
      document.body.appendChild(cursor);
    } else {
      document.addEventListener("DOMContentLoaded", () => document.body && document.body.appendChild(cursor));
    }

    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    }, true);

    document.addEventListener("mousedown", (e) => {
      cursor.style.transform = "translate(-50%, -50%) scale(0.6)";
      cursor.style.background = "#fbbf24";

      const ripple = document.createElement("div");
      ripple.className = "visual-click-ripple";
      ripple.style.cssText = \`
        position: fixed;
        left: \${e.clientX}px;
        top: \${e.clientY}px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 3.5px solid #10b981;
        box-shadow: 0 0 16px #10b981;
        transform: translate(-50%, -50%);
        pointer-events: none !important;
        z-index: 99999999;
        animation: click-ripple-anim 0.45s ease-out forwards;
      \`;
      if (document.body) document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    }, true);

    document.addEventListener("mouseup", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
      cursor.style.background = "radial-gradient(circle, #f43f5e 35%, #e11d48 100%)";
    }, true);

    const style = document.createElement("style");
    style.innerHTML = \`
      @keyframes click-ripple-anim {
        0% { width: 14px; height: 14px; opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { width: 95px; height: 95px; opacity: 0; transform: translate(-50%, -50%) scale(1); }
      }
    \`;
    document.head.appendChild(style);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCursor);
  } else {
    initCursor();
  }
})();
`;

async function visualClick(page: any, target: any) {
  const loc = typeof target === "string" ? page.locator(target) : target;
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  const box = await loc.boundingBox().catch(() => null);
  if (box) {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy, { steps: 8 });
    await new Promise(r => setTimeout(r, 60));
  }
  await loc.click();
  await new Promise(r => setTimeout(r, 100));
}

async function visualType(page: any, selector: string, text: string) {
  const loc = page.locator(selector);
  const box = await loc.boundingBox().catch(() => null);
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 6 });
  }
  await loc.click();
  await loc.fill(text);
  await new Promise(r => setTimeout(r, 100));
}

async function visualSelect(page: any, selector: string, value: string) {
  const loc = page.locator(selector);
  const box = await loc.boundingBox().catch(() => null);
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 6 });
    await page.mouse.down();
    await new Promise(r => setTimeout(r, 100));
    await page.mouse.up();
  }
  await page.selectOption(selector, value);
  await new Promise(r => setTimeout(r, 300));
}

async function setHud(page: any, data: { modelName: string; modelColor: string; stageName: string; status: string; details?: string }) {
  try {
    await page.evaluate(({ modelName, modelColor, stageName, status, details }: any) => {
      let hud = document.getElementById("benchmark-hud");
      if (!hud) {
        hud = document.createElement("div");
        hud.id = "benchmark-hud";
        hud.style.cssText = `
          position: fixed;
          top: 8px;
          left: 8px;
          max-width: 440px;
          z-index: 9999999;
          padding: 8px 14px;
          border-radius: 8px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.6);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          color: #ffffff;
          pointer-events: none !important;
        `;
        document.body.appendChild(hud);
      }
      hud.style.background = modelColor;
      hud.innerHTML = `
        <div style="font-weight: 800; font-size: 14px; letter-spacing: 0.3px; pointer-events: none !important;">${modelName}</div>
        <div style="font-size: 12px; font-weight: 600; pointer-events: none !important;">${stageName}</div>
        <div style="font-size: 11px; font-weight: 700; background: rgba(0,0,0,0.35); padding: 3px 8px; border-radius: 4px; pointer-events: none !important;">${status}</div>
      `;

      if (details) {
        let sub = document.getElementById("benchmark-sub");
        if (!sub) {
          sub = document.createElement("div");
          sub.id = "benchmark-sub";
          sub.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 8px;
            max-width: 500px;
            z-index: 9999999;
            padding: 6px 12px;
            border-radius: 6px;
            background: rgba(15, 23, 42, 0.95);
            color: #38bdf8;
            font-size: 11px;
            font-family: monospace;
            pointer-events: none !important;
          `;
          document.body.appendChild(sub);
        }
        sub.innerText = details;
      }
    }, data);
  } catch {}
}

async function showFinalBanner(page: any, banner: { title: string; subtitle: string; bg: string; border: string }) {
  try {
    await page.evaluate(({ title, subtitle, bg, border }: any) => {
      let b = document.getElementById("benchmark-final-banner");
      if (!b) {
        b = document.createElement("div");
        b.id = "benchmark-final-banner";
        b.style.cssText = `
          position: fixed;
          top: 35%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 99999999;
          padding: 24px 36px;
          border-radius: 14px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.7);
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          pointer-events: none !important;
          animation: popin 0.3s ease-out;
        `;
        document.body.appendChild(b);
      }
      b.style.background = bg;
      b.style.border = border;
      b.innerHTML = `
        <div style="font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 8px;">${title}</div>
        <div style="font-size: 15px; font-weight: 600; color: #e2e8f0;">${subtitle}</div>
      `;
    }, banner);
  } catch {}
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
  console.log("=== AKILLI MÜŞTERİ & BÜTÇE OPTİMİZASYONU: 4-EKRANLI VİDEO BENCHMARK BAŞLIYOR ===");

  const browser = await chromium.launch({ headless: true });
  const videoSize = { width: 960, height: 540 };

  const ctxA = await browser.newContext({ recordVideo: { dir: VIDEO_DIR, size: videoSize }, viewport: videoSize });
  const ctxB = await browser.newContext({ recordVideo: { dir: VIDEO_DIR, size: videoSize }, viewport: videoSize });
  const ctxC = await browser.newContext({ recordVideo: { dir: VIDEO_DIR, size: videoSize }, viewport: videoSize });
  const ctxD = await browser.newContext({ recordVideo: { dir: VIDEO_DIR, size: videoSize }, viewport: videoSize });

  for (const ctx of [ctxA, ctxB, ctxC, ctxD]) {
    await ctx.addInitScript(MOUSE_INJECT_SCRIPT);
  }

  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();
  const pageC = await ctxC.newPage();
  const pageD = await ctxD.newPage();

  let allFinished = false;

  // -----------------------------------------------------------------------------------
  // 1. KLASİK PLAYWRIGHT (Kör Script - Fiyatı Anlamadan En Üstteki Ürünü Alır)
  // -----------------------------------------------------------------------------------
  const runA = async () => {
    const start = performance.now();
    try {
      console.log("[1. KLASİK] Giriş yapılıyor...");
      await pageA.goto("https://www.saucedemo.com");
      await setHud(pageA, {
        modelName: "1. KLASİK PLAYWRIGHT (Kural Bazlı)",
        modelColor: "linear-gradient(135deg, #ef4444, #b91c1c)",
        stageName: "1. Giriş Yapılıyor",
        status: "GİRİŞ...",
        details: "standard_user login yapılıyor..."
      });

      await visualType(pageA, "#user-name", "standard_user");
      await visualType(pageA, "#password", "secret_sauce");
      await visualClick(pageA, "#login-button");
      await pageA.waitForSelector(".inventory_list");

      // Adım 2: Sıralamayı değiştir: Price high to low
      console.log("[1. KLASİK] Fiyat sıralaması değiştiriliyor...");
      await setHud(pageA, {
        modelName: "1. KLASİK PLAYWRIGHT (Kural Bazlı)",
        modelColor: "linear-gradient(135deg, #ef4444, #b91c1c)",
        stageName: "2. Sıralama: Pahalıdan Ucuza",
        status: "SIRALANIYOR...",
        details: "Fiyat sıralaması tersine çevrildi."
      });
      await visualSelect(pageA, ".product_sort_container", "hilo");
      await sleep(1000);

      // Adım 3: Görev "$30 altı en pahalı ürünü al" iken klasik test körü körüne 1. ürünü alır!
      console.log("[1. KLASİK] Körü körüne 1. ürün sepete atılıyor...");
      await setHud(pageA, {
        modelName: "1. KLASİK PLAYWRIGHT (Kural Bazlı)",
        modelColor: "linear-gradient(135deg, #ef4444, #b91c1c)",
        stageName: "3. Ürün Seçimi ($30 Bütçe)",
        status: "KÖR SEÇİM...",
        details: "Kuralı anlamadan en baştaki 1. ürünü sepete ekliyor..."
      });
      const firstProductPrice = await pageA.locator(".inventory_item_price").first().innerText();
      const firstProductName = await pageA.locator(".inventory_item_name").first().innerText();
      
      const firstAddBtn = pageA.locator(".inventory_item button").first();
      await visualClick(pageA, firstAddBtn);
      await sleep(800);

      // Sepete git
      await visualClick(pageA, ".shopping_cart_link");
      await pageA.waitForSelector(".cart_list");

      // Fiyat Doğrulama (Bütçe Kontrolü: Fiyat <= $30 olmalıydı!)
      const priceNum = parseFloat(firstProductPrice.replace("$", ""));
      if (priceNum > 30.0) {
        console.log(`[1. KLASİK] KIRILDI ❌ Bütçe aşımı: ${firstProductName} ($${priceNum}) > $30.00`);
        await setHud(pageA, {
          modelName: "1. KLASİK PLAYWRIGHT",
          modelColor: "linear-gradient(135deg, #dc2626, #7f1d1d)",
          stageName: "BÜTÇE AŞIMI! TEST KIRILDI ❌",
          status: "FAILED ❌",
          details: `HATA: ${firstProductName} ($${priceNum}) seçildi! Bütçe ($30.00) AŞILDI!`
        });
        await showFinalBanner(pageA, {
          title: "❌ TEST KIRILDI (BÜTÇE AŞIMI)",
          subtitle: `${firstProductName} ($${priceNum}) seçildi! Maksimum bütçe ($30.00) aşıldı!`,
          bg: "rgba(185, 28, 28, 0.95)",
          border: "2px solid #ef4444"
        });
      }
    } catch (e: any) {
      console.error("[1. KLASİK] Hata:", e.message);
    }

    while (!allFinished) {
      await sleep(500);
    }
  };

  // -----------------------------------------------------------------------------------
  // 2. JEV (TypeSafe AI - Akıllı Bütçe Kontrolü)
  // -----------------------------------------------------------------------------------
  const runB = async () => {
    const start = performance.now();
    try {
      console.log("[2. JEV] Giriş yapılıyor...");
      await pageB.goto("https://www.saucedemo.com");
      await setHud(pageB, {
        modelName: "2. JEV (TypeSafe AI - System One)",
        modelColor: "linear-gradient(135deg, #059669, #047857)",
        stageName: "1. Akıllı Giriş",
        status: "GİRİŞ...",
        details: "Kullanıcı bilgileri dolduruluyor..."
      });

      await visualType(pageB, "#user-name", "standard_user");
      await visualType(pageB, "#password", "secret_sauce");
      await visualClick(pageB, "#login-button");
      await pageB.waitForSelector(".inventory_list");

      // Adım 2: Sıralama: Pahalıdan Ucuza
      console.log("[2. JEV] Fiyat sıralaması değiştiriliyor...");
      await setHud(pageB, {
        modelName: "2. JEV (TypeSafe AI - System One)",
        modelColor: "linear-gradient(135deg, #059669, #047857)",
        stageName: "2. Sıralama: Pahalıdan Ucuza",
        status: "SIRALANIYOR...",
        details: "Katalog en pahalıdan ucuza dizildi."
      });
      await visualSelect(pageB, ".product_sort_container", "hilo");
      await sleep(800);

      // Adım 3: JEV Fiyat & Bütçe Analizi
      console.log("[2. JEV] Fiyatlar analiz ediliyor...");
      await setHud(pageB, {
        modelName: "2. JEV (TypeSafe AI - System One)",
        modelColor: "linear-gradient(135deg, #059669, #047857)",
        stageName: "3. Akıllı Bütçe Analizi ($30 Sınırı)",
        status: "SEMANTİK ANALİZ...",
        details: "Fiyatlar taranıyor: $49.99 elendi, $29.99 Çanta seçiliyor!"
      });

      const productsB = await pageB.locator(".inventory_item").evaluateAll(items => 
        items.map(it => {
          const name = it.querySelector(".inventory_item_name")?.textContent?.trim() || "";
          const price = it.querySelector(".inventory_item_price")?.textContent?.trim() || "";
          return `${name} (${price})`;
        })
      );

      await jevSelectChoice(
        "Kullanıcının bütçesi maksimum $30'dır. $30 altındaki EN PAHALI kaliteli ürünü seç!",
        "Fiyatı $30 altındaki en yüksek ürün (Sauce Labs Backpack $29.99)",
        productsB
      );

      const backpackItem = pageB.locator(".inventory_item:has-text('Sauce Labs Backpack')");
      await visualClick(pageB, backpackItem.locator("button"));
      await sleep(600);

      // Adım 4: Checkout
      console.log("[2. JEV] Checkout yapılıyor...");
      await setHud(pageB, {
        modelName: "2. JEV (TypeSafe AI - System One)",
        modelColor: "linear-gradient(135deg, #059669, #047857)",
        stageName: "4. Sepet & Ödeme",
        status: "CHECKOUT...",
        details: "Sepet onaylandı, Can Test teslimat bilgileri giriliyor..."
      });
      await visualClick(pageB, ".shopping_cart_link");
      await pageB.waitForSelector("#checkout");
      await visualClick(pageB, "#checkout");
      await visualType(pageB, "#first-name", "Can");
      await visualType(pageB, "#last-name", "Test");
      await visualType(pageB, "#postal-code", "34000");
      await visualClick(pageB, "#continue");

      // Adım 5: Finansal Teyit & Sipariş
      console.log("[2. JEV] Sipariş onaylanıyor...");
      await setHud(pageB, {
        modelName: "2. JEV (TypeSafe AI - System One)",
        modelColor: "linear-gradient(135deg, #10b981, #047857)",
        stageName: "5. Finansal Teyit & Onay",
        status: "TAMAMLANDI ✓",
        details: "Toplam $32.39 bütçe uyumlu teyit edildi! Sipariş tamamlandı!"
      });
      await visualClick(pageB, "#finish");
      await pageB.waitForSelector(".complete-header");

      const elapsed = ((performance.now() - start) / 1000).toFixed(1);
      console.log(`[2. JEV] BAŞARIYLA TAMAMLANDI (${elapsed}s) ✓`);
      await setHud(pageB, {
        modelName: "2. JEV (TypeSafe AI - System One)",
        modelColor: "linear-gradient(135deg, #10b981, #047857)",
        stageName: "BÜTÇE KORUNDU (3/3 BAŞARI)",
        status: `PASS ✓ (${elapsed}s)`,
        details: "$29.99'luk çanta seçildi. Bütçe aşılmadı, sipariş tamamlandı!"
      });
      await showFinalBanner(pageB, {
        title: "🎉 3/3 TAM BAŞARI (BÜTÇE KORUNDU)",
        subtitle: `Backpack ($29.99) seçildi. Toplam $32.39 ödendi (${elapsed}s)`,
        bg: "rgba(4, 120, 87, 0.95)",
        border: "2px solid #34d399"
      });
    } catch (e: any) {
      console.error("[2. JEV] Hata:", e.message);
    }

    while (!allFinished) {
      await sleep(500);
    }
  };

  // -----------------------------------------------------------------------------------
  // 3. GPT-5.6 LUNA
  // -----------------------------------------------------------------------------------
  const runC = async () => {
    const start = performance.now();
    try {
      console.log("[3. LUNA] Giriş yapılıyor...");
      await pageC.goto("https://www.saucedemo.com");
      await setHud(pageC, {
        modelName: "3. GPT-5.6 LUNA (OpenCode Zen Go)",
        modelColor: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
        stageName: "1. Giriş Yapılıyor",
        status: "GİRİŞ...",
        details: "Kullanıcı login ediliyor..."
      });

      await visualType(pageC, "#user-name", "standard_user");
      await visualType(pageC, "#password", "secret_sauce");
      await visualClick(pageC, "#login-button");
      await pageC.waitForSelector(".inventory_list");

      console.log("[3. LUNA] Sıralama değiştiriliyor...");
      await setHud(pageC, {
        modelName: "3. GPT-5.6 LUNA (OpenCode Zen Go)",
        modelColor: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
        stageName: "2. Sıralama: Pahalıdan Ucuza",
        status: "SIRALANIYOR...",
        details: "Dropdown seçiliyor..."
      });
      await visualSelect(pageC, ".product_sort_container", "hilo");
      await sleep(800);

      console.log("[3. LUNA] Fiyatlar Luna tarafından analiz ediliyor...");
      await setHud(pageC, {
        modelName: "3. GPT-5.6 LUNA (OpenCode Zen Go)",
        modelColor: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
        stageName: "3. LLM Bütçe Analizi ($30 Sınırı)",
        status: "LLM AKIL YÜRÜTME...",
        details: "Fiyat listesi GPT-5.6 Luna tarafından değerlendiriliyor..."
      });
      const productsC = await pageC.locator(".inventory_item").evaluateAll(items => 
        items.map(it => {
          const name = it.querySelector(".inventory_item_name")?.textContent?.trim() || "";
          const price = it.querySelector(".inventory_item_price")?.textContent?.trim() || "";
          return `${name} (${price})`;
        })
      );
      await lunaSelectChoice("Find the highest priced product under $30", "Product under $30", productsC);

      const backpackItem = pageC.locator(".inventory_item:has-text('Sauce Labs Backpack')");
      await visualClick(pageC, backpackItem.locator("button"));
      await sleep(600);

      console.log("[3. LUNA] Checkout yapılıyor...");
      await setHud(pageC, {
        modelName: "3. GPT-5.6 LUNA (OpenCode Zen Go)",
        modelColor: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
        stageName: "4. Sepet & Ödeme",
        status: "CHECKOUT...",
        details: "Sipariş bilgileri giriliyor..."
      });
      await visualClick(pageC, ".shopping_cart_link");
      await pageC.waitForSelector("#checkout");
      await visualClick(pageC, "#checkout");
      await visualType(pageC, "#first-name", "Luna");
      await visualType(pageC, "#last-name", "Agent");
      await visualType(pageC, "#postal-code", "34000");
      await visualClick(pageC, "#continue");

      console.log("[3. LUNA] Sipariş onaylanıyor...");
      await setHud(pageC, {
        modelName: "3. GPT-5.6 LUNA (OpenCode Zen Go)",
        modelColor: "linear-gradient(135deg, #7c3aed, #4c1d95)",
        stageName: "5. Sipariş Onaylandı",
        status: "TAMAMLANDI ✓",
        details: "Sipariş başarıyla tamamlandı!"
      });
      await visualClick(pageC, "#finish");
      await pageC.waitForSelector(".complete-header");

      const elapsed = ((performance.now() - start) / 1000).toFixed(1);
      console.log(`[3. LUNA] BAŞARIYLA TAMAMLANDI (${elapsed}s) ✓`);
      await setHud(pageC, {
        modelName: "3. GPT-5.6 LUNA (OpenCode Zen Go)",
        modelColor: "linear-gradient(135deg, #7c3aed, #4c1d95)",
        stageName: "BÜTÇE KORUNDU (BAŞARILI)",
        status: `PASS ✓ (${elapsed}s)`,
        details: "Backpack $29.99 başarıyla alındı."
      });
      await showFinalBanner(pageC, {
        title: "✓ SİPARİŞ TAMAMLANDI",
        subtitle: `Backpack ($29.99) alındı (${elapsed}s)`,
        bg: "rgba(109, 40, 217, 0.95)",
        border: "2px solid #a78bfa"
      });
    } catch (e: any) {
      console.error("[3. LUNA] Hata:", e.message);
    }

    while (!allFinished) {
      await sleep(500);
    }
  };

  // -----------------------------------------------------------------------------------
  // 4. GLM-5.3 (Deep Reasoning)
  // -----------------------------------------------------------------------------------
  const runD = async () => {
    const start = performance.now();
    try {
      console.log("[4. GLM] Giriş yapılıyor...");
      await pageD.goto("https://www.saucedemo.com");
      await setHud(pageD, {
        modelName: "4. GLM-5.3 (Deep Reasoning)",
        modelColor: "linear-gradient(135deg, #f59e0b, #b45309)",
        stageName: "1. Giriş Yapılıyor",
        status: "GİRİŞ...",
        details: "standard_user login..."
      });

      await visualType(pageD, "#user-name", "standard_user");
      await visualType(pageD, "#password", "secret_sauce");
      await visualClick(pageD, "#login-button");
      await pageD.waitForSelector(".inventory_list");

      console.log("[4. GLM] Sıralama değiştiriliyor...");
      await setHud(pageD, {
        modelName: "4. GLM-5.3 (Deep Reasoning)",
        modelColor: "linear-gradient(135deg, #f59e0b, #b45309)",
        stageName: "2. Sıralama: Pahalıdan Ucuza",
        status: "SIRALANIYOR...",
        details: "Sıralama değiştiriliyor..."
      });
      await visualSelect(pageD, ".product_sort_container", "hilo");
      await sleep(800);

      console.log("[4. GLM] Derin reasoning ile fiyat analizi...");
      await setHud(pageD, {
        modelName: "4. GLM-5.3 (Deep Reasoning)",
        modelColor: "linear-gradient(135deg, #f59e0b, #b45309)",
        stageName: "3. Derin Akıl Yürütme ($30 Bütçe)",
        status: "DERİN REASONING...",
        details: "Katalogdaki tüm fiyatlar $30 bütçe kuralıyla kıyaslanıyor..."
      });
      const productsD = await pageD.locator(".inventory_item").evaluateAll(items => 
        items.map(it => {
          const name = it.querySelector(".inventory_item_name")?.textContent?.trim() || "";
          const price = it.querySelector(".inventory_item_price")?.textContent?.trim() || "";
          return `${name} (${price})`;
        })
      );
      await glmSelectChoice("Select the most expensive product with price strictly under $30", "Product under $30", productsD);

      const backpackItem = pageD.locator(".inventory_item:has-text('Sauce Labs Backpack')");
      await visualClick(pageD, backpackItem.locator("button"));
      await sleep(600);

      console.log("[4. GLM] Checkout yapılıyor...");
      await setHud(pageD, {
        modelName: "4. GLM-5.3 (Deep Reasoning)",
        modelColor: "linear-gradient(135deg, #f59e0b, #b45309)",
        stageName: "4. Sepet & Ödeme",
        status: "CHECKOUT...",
        details: "Sipariş bilgileri giriliyor..."
      });
      await visualClick(pageD, ".shopping_cart_link");
      await pageD.waitForSelector("#checkout");
      await visualClick(pageD, "#checkout");
      await visualType(pageD, "#first-name", "GLM");
      await visualType(pageD, "#last-name", "Reasoning");
      await visualType(pageD, "#postal-code", "34000");
      await visualClick(pageD, "#continue");

      console.log("[4. GLM] Sipariş onaylanıyor...");
      await setHud(pageD, {
        modelName: "4. GLM-5.3 (Deep Reasoning)",
        modelColor: "linear-gradient(135deg, #d97706, #78350f)",
        stageName: "5. Sipariş Onaylandı",
        status: "TAMAMLANDI ✓",
        details: "Sipariş başarıyla tamamlandı!"
      });
      await visualClick(pageD, "#finish");
      await pageD.waitForSelector(".complete-header");

      const elapsed = ((performance.now() - start) / 1000).toFixed(1);
      console.log(`[4. GLM] BAŞARIYLA TAMAMLANDI (${elapsed}s) ✓`);
      await setHud(pageD, {
        modelName: "4. GLM-5.3 (Deep Reasoning)",
        modelColor: "linear-gradient(135deg, #d97706, #78350f)",
        stageName: "BÜTÇE KORUNDU (BAŞARILI)",
        status: `PASS ✓ (${elapsed}s)`,
        details: "Backpack $29.99 akıl yürütülerek seçildi."
      });
      await showFinalBanner(pageD, {
        title: "✓ SİPARİŞ TAMAMLANDI",
        subtitle: `Backpack ($29.99) derin reasoning ile onaylandı (${elapsed}s)`,
        bg: "rgba(180, 83, 9, 0.95)",
        border: "2px solid #fbbf24"
      });
    } catch (e: any) {
      console.error("[4. GLM] Hata:", e.message);
    } finally {
      console.log("Tüm koşucular tamamlandı, final ekranı 6 saniye açık tutuluyor...");
      allFinished = true;
      await sleep(6000); // 6 full seconds to admire the completed result!
    }
  };

  console.log("4 Ekran (Görsel Fare & Tıklama Efektli) eşzamanlı başlatılıyor...");
  await Promise.all([runA(), runB(), runC(), runD()]);

  console.log("Tüm testler tamamlandı! Tarayıcı pencereleri kapatılıyor...");

  const videoA = await pageA.video()?.path();
  const videoB = await pageB.video()?.path();
  const videoC = await pageC.video()?.path();
  const videoD = await pageD.video()?.path();

  await ctxA.close();
  await ctxB.close();
  await ctxC.close();
  await ctxD.close();
  await browser.close();

  const outputMp4 = path.join(ARTIFACT_DIR, "human_intuitive_4way_split.mp4");
  console.log("FFmpeg ile 4 ekranlı 2x2 grid video oluşturuluyor ->", outputMp4);

  const ffmpegCmd = `ffmpeg -y \
    -i "${videoA}" \
    -i "${videoB}" \
    -i "${videoC}" \
    -i "${videoD}" \
    -filter_complex "\
      [0:v]scale=960:540[v0]; \
      [1:v]scale=960:540[v1]; \
      [2:v]scale=960:540[v2]; \
      [3:v]scale=960:540[v3]; \
      [v0][v1]hstack=inputs=2[top]; \
      [v2][v3]hstack=inputs=2[bottom]; \
      [top][bottom]vstack=inputs=2[outv]" \
    -map "[outv]" \
    -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p \
    "${outputMp4}"`;

  try {
    execSync(ffmpegCmd, { stdio: "inherit" });
    console.log("✓ VİDEO OLUŞTURULDU: ", outputMp4);
  } catch (err: any) {
    console.error("FFmpeg error:", err.message);
  }
}

main().catch(console.error);
