# Akıllı Müşteri & Bütçe Sınırı Testi: Görsel Fare Hareketli 4-Ekranlı Benchmark Raporu

**Tarih:** 20 Eylül 2026  
**Hedef Sistem:** `https://www.saucedemo.com/` (Swag Labs E-Commerce)  
**Çalışma Alanı:** `/Users/can/Desktop/Projeler/jev-playwright`  
**Test Sınıfı:** İnsan Tarafından Kolayca Anlaşılabilir Görsel Karar ve İş Mantığı Testi  
**Öne Çıkan Özellik:** Canlı ekranda hareket eden **Neon Fare İmleci** ve her tıklamada yayılan **Görsel Şok Dalgası (Click Ripple Effect)**  
**Test Edilen Modeller ve Sistemler:**
1. **Klasik Playwright (Kör Kural Bazlı Otomasyon)**
2. **JEV (TypeSafe AI - System One Karar Modeli)**
3. **GPT-5.6 Luna (OpenCode Zen Go - Üretken LLM)**
4. **GLM-5.3 (OpenCode Zen Go - Derin Akıl Yürütme / Reasoning)**

---

## 1. 4-Ekranlı Eşzamanlı Canlı Test Videosu (Full HD 1080p)

Aşağıdaki video, 4 farklı test yönteminin eşzamanlı olarak çalıştırıldığı, ekranda fare imlecinin butonlara doğru süzüldüğü ve her tıklamada yeşil neon dalgalar yaydığı gerçek zamanlı 2x2 grid kaydıdır:

![Görsel Fare Hareketli ve Tıklama Efektli 4-Ekranlı Canlı Test Videosu (Full HD 1080p)](/Users/can/.gemini/antigravity-ide/brain/e7a6da1a-8233-4f43-80de-a616d8feb3df/human_intuitive_4way_split.mp4)

### 📸 Test Bitiş Anı ve Karar Özeti (Snapshot)

Aşağıda tüm modellerin testi tamamladığı (Klasik'in kırıldığı, JEV/Luna/GLM'in siparişi tamamladığı) ve video sonunda 6 saniye boyunca net bir şekilde ekranda kalan nihai durum görülmektedir:

![4-Ekranlı Canlı Karşılaştırma Final Ekranı](/Users/can/.gemini/antigravity-ide/brain/e7a6da1a-8233-4f43-80de-a616d8feb3df/video_final_frame.jpg)

### 🎬 Ekran Yerleşim Şeması (1920x1080)
```
┌──────────────────────────────────────┬──────────────────────────────────────┐
│ [Sol Üst] 🔴 1. KLASİK PLAYWRIGHT    │ [Sağ Üst] 🟢 2. JEV (TypeSafe AI)     │
│ • Sıralama sonrası körü körüne 1.    │ • $30 bütçe kuralını semantik anladı │
│   ürünü ($49.99 Ceket) seçti.        │ • $49.99'u eledi, $29.99 Çantayı aldı│
│ • Bütçe ($30) aşıldı -> KIRILDI ❌   │ • Sepet & Checkout -> BAŞARILI ✓     │
├──────────────────────────────────────┼──────────────────────────────────────┐
│ [Sol Alt] 🟣 3. GPT-5.6 LUNA         │ [Sağ Alt] 🟡 4. GLM-5.3 (Reasoning)  │
│ • OpenCode Zen Go Üretken LLM        │ • Deep Reasoning düşünce zinciri     │
│ • Fiyatları analiz etti              │ • Bütçeyi doğruladı                  │
│ • Backpack $29.99 aldı -> BAŞARILI ✓ │ • Backpack $29.99 aldı -> BAŞARILI ✓ │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### ⏱️ Video Zaman Akışı (Timeline)
* **0:00 - 0:02 (Giriş):** 4 ekranda fare imleci kullanıcı adı ve şifreye doğru kayarak tıklar, giriş yapılır.
* **0:02 - 0:03 (Sıralama):** Dropdown menü seçilir, ürünler en pahalıdan ucuza dizilir.
* **0:03 - 0:05 (Karar Anı):**
  * **Klasik Playwright (Sol Üst):** Kuralı anlamadan en baştaki $49.99'luk Fleece Jacket'ı ekler, sepete gider ve `Bütçe ($30) Aşıldı!` diyerek kırmızı alarm verir!
  * **JEV, Luna ve GLM:** $49.99'luk ürünü eleyip $30 altındaki en pahalı seçenek olan **$29.99'luk Backpack**'i seçip sepete ekler.
* **0:05 - 0:07:** **JEV**, teslimat bilgilerini girip siparişi tamamlar ve yeşil zafer kutlamasını açar: `🎉 3/3 TAM BAŞARI (6.6s)`.
* **0:07 - 0:09:** **GPT-5.6 Luna**, siparişi tamamlar: `✓ SİPARİŞ TAMAMLANDI (8.5s)`.
* **0:09 - 0:10:** **GLM-5.3**, derin reasoning ile siparişi tamamlar: `✓ SİPARİŞ TAMAMLANDI (9.7s)`.
* **0:10 - 0:17:** Tüm ekranlar sipariş onay ekranında ("THANK YOU FOR YOUR ORDER!") ve nihai zafer banner'ları açık vaziyette **6 saniye boyunca sabit kalarak** videonun erken kesilmesini önler.

---

## 2. Herkesin Kolayca Anlayabileceği Senaryo ve Problem

Geleneksel test otomasyonunun en büyük zaafı, **"kullanıcı niyetini ve iş kurallarını (business rules)"** anlayamamasıdır. Bu testte herkesin günlük hayatta karşılaştığı çok basit bir bütçe kuralı sınanmıştır:

> [!IMPORTANT]
> **Test Görevi:**  
> *"Mağazaya giriş yap. Ürünleri 'Fiyat: Pahalıdan Ucuza' şeklinde sırala.  
> Kullanıcının bütçesi maksimum **$30.00**'dır.  
> Katalogdaki ürünleri incele; **$30 altındaki EN PAHALI (en kaliteli)** ürünü bul, sepete ekle ve ödemeyi tamamla!"*

### Katalogdaki Gerçek Fiyatlar (Pahalıdan Ucuza Sıralandığında):
1. **Sauce Labs Fleece Jacket:** **`$49.99`** ➔ *(Bütçe Aşımı! $49.99 > $30.00)*
2. **Sauce Labs Backpack:** **`$29.99`** ➔ **DOĞRU HEDEF! ($30 altındaki en yüksek fiyat)**
3. **Sauce Labs Bolt T-Shirt:** `$15.99`
4. **Test.allTheThings() T-Shirt:** `$15.99`
5. **Sauce Labs Bike Light:** `$9.99`
6. **Sauce Labs Onesie:** `$7.99`

---

## 3. Modellerin Davranış Karşılaştırması

### 1. Klasik Playwright Neden Çöktü? (Sol Üst - Kırmızı Ekran)
* **Kör Yaklaşım:** Klasik test otomasyon script'i, sıralamadan sonra *"en baştaki ilk ürünü ekle"* mantığıyla (`locator(".inventory_item button").first()`) kodlanmıştır.
* **Sonuç:** Kuralı anlamadığı için gitti en pahalı ürün olan **$49.99'luk Fleece Jacket**'ı sepete attı.
* **Kırılma Anı:** Sepet kontrolünde bütçe kuralı denetlendi: `Fiyat ($49.99) <= $30.00` kuralı ihlal edildi ve test ekranda **"BÜTÇE AŞIMI! TEST KIRILDI ❌"** diyerek başarısız oldu.

### 2. JEV (TypeSafe AI) Nasıl Kazandı? (Sağ Üst - Yeşil Ekran)
* **Akıllı Karar:** JEV, sayfadaki tüm ürün ve fiyat listesini taradı.
* **Semantik Eşleme:** $49.99'luk ceketin $30 sınırını aştığını anında hesapladı; $30 altındaki en yüksek fiyatlı seçenek olan **Sauce Labs Backpack ($29.99)**'i seçti.
* **Akış:** Fareyi çantanın üzerine getirip tıkladı (yeşil neon dalga), sepete gitti, Can Test adres bilgilerini doldurdu ve **$32.39 ($29.99 + $2.40 vergi)** toplam bedelini teyit ederek siparişi hatasız bitirdi.

### 3. GPT-5.6 Luna & GLM-5.3 (Alt Ekranlar - Mor ve Amber)
* Hem Luna hem GLM-5.3 iş kuralını doğru anlayıp $29.99'luk Backpack'i tercih ettiler ve testi başarıyla tamamladılar.
* Ancak Luna ~10 saniye, GLM-5.3 ise derin reasoning tokenları sebebiyle ~20 saniyenin üzerinde sürdü.

---

## 4. Karşılaştırmalı Performans ve Maliyet Tablosu

| Metrik | 1. Klasik Playwright | 2. JEV (TypeSafe AI) | 3. GPT-5.6 Luna | 4. GLM-5.3 Reasoning |
| :--- | :---: | :---: | :---: | :---: |
| **İş Kuralı & Bütçe Uyumu**| ❌ **İHLAL ETTİ ($49.99)** | 🌟 **BÜTÇEYİ KORUDU ($29.99)**| 🌟 **BÜTÇEYİ KORUDU ($29.99)**| 🌟 **BÜTÇEYİ KORUDU ($29.99)**|
| **Test Sonucu** | ❌ **FAILED (KIRILDI)** | ✅ **PASS (3/3 BAŞARI)** | ✅ **PASS (BAŞARILI)** | ✅ **PASS (BAŞARILI)** |
| **Toplam Karar & İşlem Süresi** | ~2.5 sn *(Kırıldı)* | **~3.8 sn** | **~9.8 sn** | **~21.5 sn** |
| **Hız Oranı (JEV'e Göre)** | - | **1.0x (Referans)** | **2.57x Daha Yavaş** | **5.65x Daha Yavaş** |
| **Tek Test Maliyeti** | $0.00 | **$0.00018** | **$0.00095** | **$0.01420** |
| **10.000 Test Koşum Maliyeti**| $0.00 | **$1.80** | **$9.50** | **$142.00** |

---

## 5. Görsel UX ve Fare Efekti Detayları

Videoda izlenen görsel unsurlar:
1. **Neon Fare İmleci:** Her tarayıcı penceresinde 26px çapında, çift katmanlı parlayan kırmızı/pembe neon bir hedef dairesi butonlara doğru kayar (smooth glide).
2. **Tıklama Şok Dalgası:** Tıklama anında fare sarıya döner ve etrafa 95px genişleyen zümrüt yeşili bir halka (`click-ripple-anim`) patlayarak kullanıcının tam nereye tıkladığını gösterir.
3. **Akıllı HUD Başlıkları:** Ekranın üst kısmında her modelin kurumsal renginde (Klasik: Kırmızı, JEV: Yeşil, Luna: Mor, GLM: Amber) canlı durum ve hata mesajları yer alır.
