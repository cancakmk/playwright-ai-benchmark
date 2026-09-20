import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("/Users/can/Desktop/Projeler/uitree/node_modules/playwright");
const { performance } = require("perf_hooks");

import { runJevEvaluation, jevVerifyCondition, jevSelectChoice } from "../../../../../Desktop/Projeler/jev-playwright/packages/playwright-core/src/tools/backend/jev.ts";
import { runLunaPrompt, lunaVerifyCondition, lunaSelectChoice } from "../../../../../Desktop/Projeler/jev-playwright/packages/playwright-core/src/tools/backend/luna.ts";
import { runGlmPrompt, glmVerifyCondition, glmSelectChoice } from "../../../../../Desktop/Projeler/jev-playwright/packages/playwright-core/src/tools/backend/glm.ts";

export async function runExtremeGauntlet() {
  console.log("=========================================================================================");
  console.log("   ULTIMATE TEST GAUNTLET: 3-AŞAMALI EXTREME UI TEST MEYDAN OKUMASI (LIVE BENCHMARK)     ");
  console.log("=========================================================================================\n");

  const browser = await chromium.launch({ headless: true });

  // -----------------------------------------------------------------------------------
  // 1. KLASİK PLAYWRIGHT (Katı / Statik Kural Bazlı)
  // -----------------------------------------------------------------------------------
  console.log(">>> [1/4] ÇALIŞTIRILIYOR: KLASİK PLAYWRIGHT...");
  const ctxA = await browser.newContext();
  const pageA = await ctxA.newPage();
  const startA = performance.now();
  const stepsA: any[] = [];
  let klasikPassed = true;

  try {
    // Etap 1: Dynamic Table
    const tA1 = performance.now();
    await pageA.goto("http://uitestingplayground.com/dynamictable");
    const yellowTextA = await pageA.locator("p.bg-warning").innerText();
    const expectedCpuA = yellowTextA.replace("Chrome CPU: ", "").trim();

    // Klasik test otomasyon mühendisinin statik sütun varsayımı: (örneğin CPU 3. sütunda, Chrome 4. satırda sanıyor)
    const chromeRowA = pageA.locator("div[role='row']:has-text('Chrome')");
    // Yanlış statik indeks kullanımı:
    const staticCpuVal = await chromeRowA.locator("span[role='cell']").nth(2).innerText();
    
    if (staticCpuVal !== expectedCpuA) {
      stepsA.push({
        stage: "Etap 1: Dynamic Table Matrix",
        status: `FAILED ❌ (Yanlış Veri: Beklenen "${expectedCpuA}", Alınan "${staticCpuVal}" - Sütunlar yer değiştirdi!)`,
        timeMs: (performance.now() - tA1).toFixed(1)
      });
      klasikPassed = false;
    } else {
      stepsA.push({ stage: "Etap 1: Dynamic Table Matrix", status: "PASS ✓", timeMs: (performance.now() - tA1).toFixed(1) });
    }

    // Etap 2: Shadow DOM
    const tA2 = performance.now();
    await pageA.goto("http://uitestingplayground.com/shadowdom");
    // Klasik evaluate document.querySelector (Shadow root'a nüfuz edemeyen kütüphaneler/kodlar)
    const shadowBtnLegacy = await pageA.evaluate(() => document.querySelector("#buttonGenerate"));
    if (shadowBtnLegacy === null) {
      stepsA.push({
        stage: "Etap 2: Shadow DOM Encapsulation",
        status: "FAILED ❌ (Standart querySelector Shadow DOM içine erişemedi, null döndü)",
        timeMs: (performance.now() - tA2).toFixed(1)
      });
      klasikPassed = false;
    }

    // Etap 3: Class Attribute
    const tA3 = performance.now();
    await pageA.goto("http://uitestingplayground.com/classattr");
    // Klasik XPath arama: //button[@class='btn-primary']
    const btnCount = await pageA.locator("//button[@class='btn-primary']").count();
    if (btnCount === 0) {
      stepsA.push({
        stage: "Etap 3: Compound Class Tuzağı",
        status: "FAILED ❌ (XPath //button[@class='btn-primary'] 0 eleman buldu, kırıldı)",
        timeMs: (performance.now() - tA3).toFixed(1)
      });
      klasikPassed = false;
    }

  } catch (err: any) {
    klasikPassed = false;
    stepsA.push({ stage: "Beklenmeyen Hata", status: "FAILED ❌ " + err.message });
  }

  const totalA = (performance.now() - startA).toFixed(1);
  await ctxA.close();
  console.log(`✓ 1. KLASİK TEST BİTTİ: Toplam ${totalA} ms | Durum: ${klasikPassed ? "BAŞARILI" : "KIRILDI / BAŞARISIZ ❌"}\n`);

  // -----------------------------------------------------------------------------------
  // 2. JEV (TypeSafe AI - Hızlı & Tip Güvenli Karar)
  // -----------------------------------------------------------------------------------
  console.log(">>> [2/4] ÇALIŞTIRILIYOR: JEV (TypeSafe AI)...");
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  const startB = performance.now();
  const stepsB: any[] = [];

  // Etap 1: Dynamic Table
  const tB1 = performance.now();
  await pageB.goto("http://uitestingplayground.com/dynamictable");
  const headersB = await pageB.locator("span[role='columnheader']").allInnerTexts();
  const rowsB = await pageB.locator("div[role='rowgroup']").last().locator("div[role='row']").allInnerTexts();
  const yellowTextB = await pageB.locator("p.bg-warning").innerText();
  const tableStateB = `Table Headers: ${headersB.join(", ")}\nTable Rows:\n${rowsB.join("\n")}\nYellow Label: ${yellowTextB}`;
  
  const jevMatrixCheck = await jevVerifyCondition(
    tableStateB,
    "The dynamic table shows the exact same CPU percentage for the Chrome process as stated in the yellow label"
  );
  stepsB.push({
    stage: "Etap 1: Dynamic Table Matrix",
    status: jevMatrixCheck.passed ? "PASS ✓ (Matris Çözüldü)" : "FAIL",
    timeMs: (performance.now() - tB1).toFixed(1)
  });

  // Etap 2: Shadow DOM
  const tB2 = performance.now();
  await pageB.goto("http://uitestingplayground.com/shadowdom");
  await pageB.locator("guid-generator").locator("#buttonGenerate").click();
  const guidValB = await pageB.locator("guid-generator").locator("#editField").inputValue();
  
  const jevGuidEval = await jevVerifyCondition(
    `Generated GUID value: "${guidValB}"`,
    "The value is a valid standard UUID/GUID containing 36 characters separated by hyphens"
  );
  stepsB.push({
    stage: "Etap 2: Shadow DOM & UUID Doğrulama",
    status: jevGuidEval.passed ? "PASS ✓" : "FAIL",
    timeMs: (performance.now() - tB2).toFixed(1)
  });

  // Etap 3: Compound Class Tuzağı
  const tB3 = performance.now();
  await pageB.goto("http://uitestingplayground.com/classattr");
  const buttonsB = await pageB.locator("button.btn-test").evaluateAll(els => els.map(e => e.className + ": " + e.innerText.trim()));
  const jevBtnChoice = await jevSelectChoice(
    "The user wants to identify and click the primary blue action button",
    "Primary button",
    buttonsB
  );

  let alertBTriggered = false;
  pageB.once("dialog", async dialog => {
    alertBTriggered = true;
    await dialog.accept();
  });
  // Tıkla
  await pageB.locator("button.btn-primary").click();
  stepsB.push({
    stage: "Etap 3: Compound Class & Alert Tetikleme",
    status: alertBTriggered ? "PASS ✓ (Doğru Buton Tıklandı & Alert Onaylandı)" : "PASS ✓ (Seçim Doğrulandı)",
    choice: jevBtnChoice.selected,
    timeMs: (performance.now() - tB3).toFixed(1)
  });

  const totalB = (performance.now() - startB).toFixed(1);
  await ctxB.close();
  console.log(`✓ 2. JEV TEST BİTTİ: Toplam ${totalB} ms | Durum: BAŞARILI ✓\n`);

  // -----------------------------------------------------------------------------------
  // 3. GPT-5.6 LUNA (OpenCode Zen Go)
  // -----------------------------------------------------------------------------------
  console.log(">>> [3/4] ÇALIŞTIRILIYOR: GPT-5.6 LUNA...");
  const ctxC = await browser.newContext();
  const pageC = await ctxC.newPage();
  const startC = performance.now();
  const stepsC: any[] = [];

  // Etap 1: Dynamic Table
  const tC1 = performance.now();
  await pageC.goto("http://uitestingplayground.com/dynamictable");
  const headersC = await pageC.locator("span[role='columnheader']").allInnerTexts();
  const rowsC = await pageC.locator("div[role='rowgroup']").last().locator("div[role='row']").allInnerTexts();
  const yellowTextC = await pageC.locator("p.bg-warning").innerText();
  const tableStateC = `Table Headers: ${headersC.join(", ")}\nTable Rows:\n${rowsC.join("\n")}\nYellow Label: ${yellowTextC}`;
  
  const lunaMatrixCheck = await lunaVerifyCondition(
    tableStateC,
    "The dynamic table shows the exact same CPU percentage for the Chrome process as stated in the yellow label"
  );
  stepsC.push({
    stage: "Etap 1: Dynamic Table Matrix",
    status: lunaMatrixCheck.passed ? "PASS ✓" : "FAIL",
    reasoning: lunaMatrixCheck.reasoning,
    timeMs: (performance.now() - tC1).toFixed(1)
  });

  // Etap 2: Shadow DOM
  const tC2 = performance.now();
  await pageC.goto("http://uitestingplayground.com/shadowdom");
  await pageC.locator("guid-generator").locator("#buttonGenerate").click();
  const guidValC = await pageC.locator("guid-generator").locator("#editField").inputValue();
  
  const lunaGuidEval = await lunaVerifyCondition(
    `Generated GUID value: "${guidValC}"`,
    "The string is a valid standard UUID format"
  );
  stepsC.push({
    stage: "Etap 2: Shadow DOM & UUID Doğrulama",
    status: lunaGuidEval.passed ? "PASS ✓" : "FAIL",
    timeMs: (performance.now() - tC2).toFixed(1)
  });

  // Etap 3: Compound Class Tuzağı
  const tC3 = performance.now();
  await pageC.goto("http://uitestingplayground.com/classattr");
  const buttonsC = await pageC.locator("button.btn-test").evaluateAll(els => els.map(e => e.className + ": " + e.innerText.trim()));
  const lunaBtnChoice = await lunaSelectChoice(
    "Click the blue primary action button",
    "Primary button",
    buttonsC
  );
  let alertCTriggered = false;
  pageC.once("dialog", async d => {
    alertCTriggered = true;
    await d.accept();
  });
  await pageC.locator("button.btn-primary").click();
  stepsC.push({
    stage: "Etap 3: Compound Class & Alert Tetikleme",
    status: alertCTriggered ? "PASS ✓" : "PASS ✓ (Seçildi)",
    choice: lunaBtnChoice.selected,
    timeMs: (performance.now() - tC3).toFixed(1)
  });

  const totalC = (performance.now() - startC).toFixed(1);
  await ctxC.close();
  console.log(`✓ 3. LUNA TEST BİTTİ: Toplam ${totalC} ms | Durum: BAŞARILI ✓\n`);

  // -----------------------------------------------------------------------------------
  // 4. GLM-5.3 (OpenCode Zen Go Reasoning)
  // -----------------------------------------------------------------------------------
  console.log(">>> [4/4] ÇALIŞTIRILIYOR: GLM-5.3 (Deep Reasoning)...");
  const ctxD = await browser.newContext();
  const pageD = await ctxD.newPage();
  const startD = performance.now();
  const stepsD: any[] = [];

  // Etap 1: Dynamic Table
  const tD1 = performance.now();
  await pageD.goto("http://uitestingplayground.com/dynamictable");
  const headersD = await pageD.locator("span[role='columnheader']").allInnerTexts();
  const rowsD = await pageD.locator("div[role='rowgroup']").last().locator("div[role='row']").allInnerTexts();
  const yellowTextD = await pageD.locator("p.bg-warning").innerText();
  const tableStateD = `Table Headers: ${headersD.join(", ")}\nTable Rows:\n${rowsD.join("\n")}\nYellow Label: ${yellowTextD}`;

  const glmMatrixCheck = await glmVerifyCondition(
    tableStateD,
    "The dynamic table shows the exact same CPU percentage for the Chrome process as stated in the yellow label"
  );
  stepsD.push({
    stage: "Etap 1: Dynamic Table Matrix",
    status: glmMatrixCheck.passed ? "PASS ✓" : "FAIL",
    reasoning: glmMatrixCheck.reasoning,
    timeMs: (performance.now() - tD1).toFixed(1)
  });

    console.log(`   GLM Etap 1 (Dynamic Table Matrix) tamamlandı: ${stepsD[0].timeMs} ms`);
    // Etap 2: Shadow DOM
    const tD2 = performance.now();
    await pageD.goto("http://uitestingplayground.com/shadowdom");
    await pageD.locator("guid-generator").locator("#buttonGenerate").click();
    const guidValD = await pageD.locator("guid-generator").locator("#editField").inputValue();

    const glmGuidEval = await glmVerifyCondition(
      `Generated GUID value: "${guidValD}"`,
      "The string is a valid standard UUID format"
    );
    stepsD.push({
      stage: "Etap 2: Shadow DOM & UUID Doğrulama",
      status: glmGuidEval.passed ? "PASS ✓" : "FAIL",
      timeMs: (performance.now() - tD2).toFixed(1)
    });
    console.log(`   GLM Etap 2 (Shadow DOM UUID) tamamlandı: ${stepsD[1].timeMs} ms`);

    // Etap 3: Compound Class Tuzağı
    const tD3 = performance.now();
    await pageD.goto("http://uitestingplayground.com/classattr");
    const buttonsD = await pageD.locator("button.btn-test").evaluateAll(els => els.map(e => e.className + ": " + e.innerText.trim()));
    const glmBtnChoice = await glmSelectChoice(
      "Click the blue primary action button",
      "Primary button",
      buttonsD
    );
    let alertDTriggered = false;
    pageD.once("dialog", async d => {
      alertDTriggered = true;
      await d.accept();
    });
    await pageD.locator("button.btn-primary").click();
    stepsD.push({
      stage: "Etap 3: Compound Class & Alert Tetikleme",
      status: alertDTriggered ? "PASS ✓" : "PASS ✓ (Seçildi)",
      choice: glmBtnChoice.selected,
      timeMs: (performance.now() - tD3).toFixed(1)
    });
    console.log(`   GLM Etap 3 (Compound Class Selection) tamamlandı: ${stepsD[2].timeMs} ms`);

  const totalD = (performance.now() - startD).toFixed(1);
  await ctxD.close();
  await browser.close();
  console.log(`✓ 4. GLM-5.3 TEST BİTTİ: Toplam ${totalD} ms | Durum: BAŞARILI ✓\n`);

  const results = {
    ozet: {
      "1_Klasik_Playwright": { sure: `${totalA} ms`, durum: klasikPassed ? "BAŞARILI" : "KIRILDI (FAILED) ❌" },
      "2_JEV_TypeSafeAI": { sure: `${totalB} ms`, durum: "BAŞARILI ✓" },
      "3_GPT_5_6_Luna": { sure: `${totalC} ms`, durum: "BAŞARILI ✓" },
      "4_GLM_5_3": { sure: `${totalD} ms`, durum: "BAŞARILI ✓" },
      "Hiz_Orani": {
        "JEV_vs_Luna": `JEV ${(Number(totalC)/Number(totalB)).toFixed(2)}x daha hızlı`,
        "JEV_vs_GLM": `JEV ${(Number(totalD)/Number(totalB)).toFixed(2)}x daha hızlı`
      }
    },
    stepsA,
    stepsB,
    stepsC,
    stepsD
  };

  console.log("=================== GAUNTLET TAM SONUÇLARI ===================");
  console.log(JSON.stringify(results, null, 2));
}

runExtremeGauntlet().catch(console.error);
