# پرامپت جامع بازطراحی رابط کاربری به سبک Native iOS 26 Liquid Glass

**پروژه هدف:** هاب دانش و فرصت‌ها ([radar.salehi.my](https://radar.salehi.my/)) — نسخه اختصاصی وب‌اپ آیفون (iPhone-Only PWA)

این سند شامل دو بخش است:

1. **پرامپت اصلی انگلیسی (Recommended Master Prompt):** بهینه‌شده برای بالاترین دقت در ایجنت‌های کدنویسی (Cursor، Claude Code، Windsurf، Cline و Copilot) با حفظ کامل ساختار RTL، تگ‌های فارسی و تمام کامپوننت‌های فعلی پروژه شما.

2. **پرامپت نسخه فارسی:** در صورتی که ترجیح می‌دهید دستور را به زبان فارسی به ایجنت بدهید.

## ۱. پرامپت اصلی برای ایجنت کدنویسی (English Master Prompt — Copy & Paste)

متن داخل باکس زیر را کپی کرده و مستقیماً به ایجنت کدنویسی خود بدهید (یا این فایل را در ریشه پروژه قرار داده و به ایجنت بگویید `@ios_liquid_glass_redesign_prompt.md` را اجرا کند):

````
# Role & Objective
You are an elite Apple Human Interface Guidelines (HIG) UI/UX Engineer and Senior Frontend Architect specializing in iOS 26 "Liquid Glass" design systems, WebKit/Safari mobile optimization, and RTL (Persian) Progressive Web Apps (PWAs).

Your task is to completely refactor and redesign the UI/UX of this web application ("Knowledge & Opportunity Hub" / هاب دانش و فرصت‌ها — `radar.salehi.my`) into a **100% Native-Feeling iPhone-Only iOS 26 Liquid Glass App**.

The user will ONLY use this app on an iPhone (Mobile Safari & iOS Home Screen Standalone PWA). Do NOT preserve clunky desktop layouts or desktop sidebars. Every screen, card, pill, bottom sheet, and navigation bar must look and feel indistinguishable from a flagship native iOS 26 app built with SwiftUI's `.glassEffect()` and translucent refractive materials.

---

# 1. Core Architectural & Viewport Rules (iPhone-First Native Shell)

1. **Strict iPhone Viewport & Frame:**
   - Optimize exclusively for iPhone viewports (`375px` to `440px` width, `100dvh` height).
   - If opened on a wider screen during development, lock the entire app inside a centered iPhone shell (`max-width: 430px; margin: 0 auto; min-height: 100dvh; position: relative; overflow-x: hidden;`).
   - Remove any desktop-only right sidebar navigation; unify all navigation into the **iOS Floating Liquid Glass Tab Bar** at the bottom and contextual top glass controls.
2. **iOS PWA & Safe Area Integration:**
   - Ensure `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />`, `<meta name="apple-mobile-web-app-capable" content="yes" />`, and `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />` are configured.
   - Respect iOS Safe Areas everywhere:
     - Top Header: `padding-top: max(env(safe-area-inset-top), 16px);`
     - Main Scroll Container: `padding-bottom: calc(env(safe-area-inset-bottom) + 104px);` so feed cards scroll smoothly **underneath** the floating bottom glass dock, creating live optical refraction.
3. **Native iOS Touch & Gesture Physics:**
   - Apply `-webkit-tap-highlight-color: transparent; -webkit-touch-callout: none;` globally.
   - Apply `user-select: none;` to all interactive buttons, chips, headers, and navigation items.
   - Add spring-based press feedback on all interactive cards, pills, and buttons: `active:scale-[0.96] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]`.
   - Use smooth momentum scrolling with `overscroll-behavior-y: contain`.

---

# 2. The iOS 26 "Liquid Glass" Material System (CSS + SVG Refraction)

Do NOT settle for flat dark gray boxes or basic `backdrop-filter: blur(8px)`. Implement Apple's **3-Layer Liquid Glass Meta-Material** (Lensing/Refraction + Adaptive Gel Tint + Specular Edge Illumination):

### A. Living Ambient Background Canvas (Crucial for Glass Refraction)
Glass looks lifeless over a flat solid background. Create a fixed, GPU-accelerated ambient background layer (`position: fixed; inset: 0; z-index: -1; pointer-events: none; background: #03070E;`) containing 3–4 slow-drifting radial light orbs (`filter: blur(95px); opacity: 0.32;`):
- **Top-Right Orb (Inbox / Hero Aura):** Rose-Magenta to Violet (`radial-gradient(circle, rgba(236,72,153,0.45), rgba(99,102,241,0.15), transparent 70%)`) on the Inbox tab, morphing smoothly to Emerald-Teal (`rgba(16,185,129,0.42)`) on the Job Radar tab.
- **Center-Left Orb:** Deep Cyan (`rgba(6,182,212,0.28)`).
- **Bottom Dock Under-Glow:** Subtle Aqua-Indigo glow (`rgba(34,211,238,0.22)`).

### B. Hidden SVG Optical Refraction Filter
Inject a global hidden `<svg width="0" height="0" class="sr-only">` in the root layout to provide subtle liquid edge lensing for floating controls and the bottom dock:
```html
<svg width="0" height="0" style="position: absolute; pointer-events: none;">
  <defs>
    <filter id="ios-liquid-glass" x="-10%" y="-10%" width="120%" height="120%" filterUnits="objectBoundingBox">
      <feTurbulence type="fractalNoise" baseFrequency="0.015 0.015" numOctaves="1" seed="7" result="noise" />
      <feGaussianBlur in="noise" stdDeviation="2.5" result="softNoise" />
      <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="12" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
</svg>

````

### C. Reusable Liquid Glass CSS Tokens & Utility Classes

Define these exact material tiers in the global stylesheet:

1. **`.ios-glass-card` (Primary Feed Cards & Summary Containers):**

   * `background: linear-gradient(145deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 55%, rgba(255, 255, 255, 0.06) 100%);`

   * `backdrop-filter: blur(28px) saturate(190%) brightness(1.05);`

   * `-webkit-backdrop-filter: blur(28px) saturate(190%) brightness(1.05);`

   * `border-radius: 28px;` (Apple continuous squircle aesthetic)

   * `border: 1px solid rgba(255, 255, 255, 0.14);`

   * `box-shadow: inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.38), inset 0 -1px 0.5px 0 rgba(255, 255, 255, 0.06), inset 1px 0 0.5px 0 rgba(255, 255, 255, 0.15), 0 14px 34px -10px rgba(0, 0, 0, 0.55);`

2. **`.ios-glass-subtile` (Inner Nested Metric Boxes inside Hero Cards):**

   * Avoid messy "heavy glass on heavy glass". Use a recessed translucent dark-gel surface:

   * `background: linear-gradient(160deg, rgba(255, 255, 255, 0.06) 0%, rgba(0, 0, 0, 0.22) 100%);`

   * `border-radius: 20px;`

   * `border: 1px solid rgba(255, 255, 255, 0.09);`

   * `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);`

3. **`.ios-glass-dock` (Floating Bottom Tab Bar & Sticky Navigation Overlays):**

   * `background: linear-gradient(180deg, rgba(30, 41, 59, 0.55) 0%, rgba(15, 23, 42, 0.72) 100%);`

   * `backdrop-filter: blur(36px) saturate(210%) contrast(1.05);`

   * `-webkit-backdrop-filter: blur(36px) saturate(210%) contrast(1.05);`

   * `border-radius: 9999px;`

   * `border: 1px solid rgba(255, 255, 255, 0.22);`

   * `box-shadow: inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.12), 0 20px 45px -8px rgba(0, 0, 0, 0.7), 0 0 24px -4px rgba(34, 211, 238, 0.15);`

4. **`.ios-glass-pill` & `.ios-glass-pill-active` (Filter Chips & Action Buttons):**

   * Default Pill: `background: rgba(255, 255, 255, 0.06); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25); border-radius: 9999px;`

   * Active Tinted Liquid Glass Pill (Cyan/Aqua or Emerald): Instead of a flat opaque fill, use a glowing translucent gel (`background: linear-gradient(135deg, rgba(34, 211, 238, 0.38) 0%, rgba(6, 182, 212, 0.22) 100%); border: 1px solid rgba(103, 232, 249, 0.65); box-shadow: inset 0 1.5px 1px rgba(255, 255, 255, 0.65), 0 6px 20px -4px rgba(6, 182, 212, 0.45); color: #ECFEFF;`).

# 3. Typography & RTL Precision

* **Font Stack:** Use `Vazirmatn` or `IRANSansX` for Persian text paired seamlessly with `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text"` for English titles (`Senior Frontend Engineer (React)`, `Lumen Pay`, `TechCrunch`, `$85k – $110k`).

* **Direction & Alignment:** Strict `dir="rtl"` layout. Ensure English job titles, salary ranges, and tech stack tags (`React 18+`, `TypeScript`, `FastAPI`, `PWA`) render with `dir="ltr"` inline where appropriate so parentheses and `+` signs never flip.

* **Legibility Over Glass:** Use crisp white (`#F8FAFC`) for primary headings, soft platinum (`rgba(226, 232, 240, 0.82)`) for body snippets, and subtle `text-shadow: 0 1px 2px rgba(0,0,0,0.35)` on large glass numbers (`۱۰`, `۷۲٪`, `۹۲`).

# 4. Screen-by-Screen & Component Redesign Specifications

### A. iOS Large Title Header (Dynamic Collapsing Glass Navbar)

* **Expanded State (Top of Scroll):**

  * Right-aligned subtitle in glowing cyan (`Knowledge & Opportunity Hub` or `امتیازدهی هوشمند فرصت‌ها`) above a bold 34px iOS Large Title (`ورودی`, `رادار شغلی`, `جستجو`, `نشان‌شده`, `تنظیمات`).

  * Left-aligned circular/capsule Liquid Glass action button: a 44×44px circular glass refresh button on `ورودی`, or a glass sort pill (`بیشترین تطابق` with sort icon) on `رادار شغلی`.

* **Scrolled State:**

  * When scrolling down past `48px`, smoothly transition into a compact sticky top glass bar (`height: 54px`, `backdrop-filter: blur(30px) saturate(200%)`, subtle bottom specular border `rgba(255,255,255,0.1)`).

### B. Hero Summary Widget — Inbox (`ورودی`)

* **Container:** `.ios-glass-card` with a subtle internal radial crimson/magenta/violet mesh highlight in the top-left corner and a cyan/indigo shimmer on the right.

* **Top Row:** Right side features a floating tinted glass badge (`✨ خلاصه هوشمند امروز`) with a delicate cyan rim; left side displays the Persian date (`پنجشنبه ۳۰ مهر`) in muted silver.

* **Middle Metrics Row:**

  * Right: Giant glossy counter `۱۰` (`font-size: 3.25rem; font-weight: 800; background: linear-gradient(180deg, #FFFFFF 0%, #A5B4FC 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;`) with label `مورد خوانده‌نشده`.

  * Left: Two `.ios-glass-subtile` cards side-by-side: `۲ شغل پرتطابق` (emerald neon number `#34D399`) and `۳ خبر تازه` (amber gold number `#FBBF24`).

* **Bottom Highlight Rows:** Two sleek recessed glass strips for top items (`مدل جدید استدلال چندوجهی را معرفی کرد OpenAI` and `Senior Frontend Engineer (React)`), each accented on the right with a glowing vertical neon pill bar (`width: 4px; border-radius: 999px; background: linear-gradient(180deg, #38BDF8, #818CF8); box-shadow: 0 0 10px rgba(56,189,248,0.6);`).

### C. Hero Summary Widget — Job Radar (`رادار شغلی`)

* **Container:** `.ios-glass-card` with a subtle radar-sweep radial conic gradient glow in emerald/teal in the top-left corner.

* **Top Score:** Right-aligned label `میانگین تطابق با پروفایل شما` in glowing emerald, with a huge `۷۲٪` specular display number.

* **3 Pipeline Stat Subtiles:** Three `.ios-glass-subtile` boxes in a 3-column grid: `۱ ذخیره‌شده`, `۱ ارسال رزومه`, `۱ مصاحبه`.

* **Monitored Skills Strip:** Horizontal scrollable row of emerald-tinted Liquid Glass mini-pills (`React`, `TypeScript`, `Python`, `FastAPI`, `PWA`, `Tailwind`).

### D. Horizontal Liquid Glass Filter Bar

* Sticky or inline horizontal scroll strip (`overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding: 4px 16px; gap: 8px;`).

* Each chip uses `.ios-glass-pill` with item count (`همه ۱۲`, `اخبار ۳`, `تلگرام ۲`, `ایمیل ۲`, `شغل‌ها ۵` or `همه ۵`, `جدید ۲`, `ذخیره‌شده ۱`, `ارسال رزومه ۱`, `مصاحبه ۱`).

* Active chip uses `.ios-glass-pill-active` with a smooth sliding layout transition.

### E. Feed Cards & Job Cards (with Native Swipe Gestures)

* **Glass Surface:** `.ios-glass-card` (`padding: 18px; border-radius: 26px;`).

* **Top Metadata Bar:**

  * Right: Glowing unread cyan dot (`box-shadow: 0 0 8px #22D3EE`) + Tinted glass source badge (`TechCrunch 🛜` in warm amber glass, or `RemoteOK 💼` in emerald glass).

  * Left: Relative timestamp (`۱ ساعت پیش`, `۳ ساعت پیش`).

* **Job Match Gauge (for Job Cards):**

  * Left-positioned circular SVG progress ring (`۹۲`) with a glowing emerald stroke (`stroke: url(#emerald-glow); filter: drop-shadow(0 0 6px rgba(16,185,129,0.5));`) and dark-glass inner well.

* **Footer & Skill Tags:**

  * Recessed frosted glass tag pills (`#React`, `#TypeScript`, `#PWA`) + interactive glass bookmark icon button on the left.

* **Touch Swipe Gesture:** Support horizontal touch drag on cards with rubber-band resistance (swipe right reveals a glowing Amber Glass "نشان کردن" action; swipe left reveals a Slate/Crimson Glass "آرشیو" action).

### F. iOS 26 Floating Liquid Glass Bottom Tab Bar (Dock)

* **Positioning:** Fixed floating capsule at the bottom (`position: fixed; bottom: calc(env(safe-area-inset-bottom) + 10px); left: 14px; right: 14px; max-width: 402px; margin: 0 auto; height: 68px; z-index: 50;`).

* **Material:** `.ios-glass-dock` with multi-layered specular rim light and deep ambient shadow so scrolling cards visibly refract behind it.

* **Tabs & Sliding Liquid Pill:**

  * Include the primary tabs (`ورودی`, `رادار شغلی`, `جستجو`, `نشان‌شده`, `تنظیمات` — and if extra modules like `Product Hunt` or `پروژه‌ها` exist, integrate them cleanly via a segmented sub-switcher inside Inbox/Search or a scrollable glass dock).

  * The active tab is highlighted by a **Liquid Glass Lens Pill** (`background: linear-gradient(180deg, rgba(56, 189, 248, 0.28) 0%, rgba(14, 165, 233, 0.14) 100%); border: 1px solid rgba(125, 211, 252, 0.45); box-shadow: inset 0 1px 1px rgba(255,255,255,0.45), 0 4px 14px rgba(14,165,233,0.25); border-radius: 9999px;`) that animates smoothly between tabs.

  * **Notification Badges:** Glossy iOS red pill badges (`۵`, `۲`) with subtle inner top shine and `box-shadow: 0 2px 8px rgba(239, 68, 68, 0.55)`.

### G. Native iOS Detent Bottom Sheet (Job / Article Detail Modal)

* **Presentation Animation & Background Scaling:**

  * When opening an item (`Senior Frontend Engineer (React)` or `حالت مطالعه تمیز`), dim and blur the backdrop (`backdrop-filter: blur(12px); background: rgba(2, 6, 23, 0.55);`) and subtly scale down the underlying app view (`transform: scale(0.95) translateY(6px); border-radius: 36px; transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);`) just like native iOS modal sheets.

* **Sheet Container:**

  * `border-radius: 38px 38px 0 0;`

  * `background: linear-gradient(180deg, rgba(24, 34, 52, 0.84) 0%, rgba(10, 15, 28, 0.94) 100%);`

  * `backdrop-filter: blur(44px) saturate(200%);`

  * Top specular rim: `border-top: 1px solid rgba(255, 255, 255, 0.32); box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 -16px 48px rgba(0,0,0,0.65);`

  * Top grabber handle: `width: 42px; height: 5px; border-radius: 999px; background: rgba(255,255,255,0.28); margin: 10px auto 16px;`.

* **Inside the Sheet:**

  1. **AI Analysis Card (`✨ تحلیل هوش مصنوعی`):** Emerald-tinted Liquid Glass card combining the glowing `۹۲ درصد تطابق` circular ring on the right with the Persian AI match explanation on the left.

  2. **3-Column Glass Metadata Row:** Three `.ios-glass-subtile` cards with top-right icons: `🌐 دورکاری`, `📍 Berlin, DE`, `👛 $85k – $110k`.

  3. **Application Status Selector (`وضعیت درخواست`):** Horizontal row of interactive Liquid Glass pills (`جدید`, `ذخیره‌شده`, `ارسال رزومه`, `مصاحبه`, `رد شده`), where the active status (`جدید`) glows in translucent emerald glass.

  4. **Requirements Chips (`نیازمندی‌ها`):** Frosted glass chips (`React 18+`, `TypeScript`, `Service Workers`, `Design Systems`, `+۵ سال تجربه`).

  5. **Full Description (`متن کامل`) & Sticky Glass Action Bar:** Clean readable body text with a floating bottom Liquid Glass CTA button (`مشاهده آگهی اصلی` / `اشتراک‌گذاری`).

# 5. Implementation Deliverables Expected from You

1. Inspect the existing project structure, components, and CSS/Tailwind setup first.

2. Add the global **Liquid Glass CSS variables, utility classes, ambient background orbs, and SVG refraction filter** to the main stylesheet / root layout.

3. Refactor the layout shell, header, hero summary cards, filter pills, feed/job cards, bottom floating tab bar, and detail bottom sheet to use the new iOS 26 Liquid Glass system.

4. Preserve all existing data bindings, state management, filters, and Persian RTL text while upgrading every visual surface and transition to 60fps iOS native quality.

````

## ۲. نسخه فارسی پرامپت (برای استفاده مستقیم به زبان فارسی)

اگر ترجیح می‌دهید پرامپت را به زبان فارسی به ایجنت کدنویسی بدهید، متن زیر را کپی کنید:

```markdown
تو یک معمار ارشد فرانت‌اند و طراح رابط کاربری متخصص در استانداردهای Apple Human Interface Guidelines (HIG) و زبان طراحی جدید **iOS 26 Liquid Glass** هستی.

هدف: بازطراحی کامل رابط کاربری (UI/UX) این پروژه («هاب دانش و فرصت‌ها» - radar.salehi.my) به یک وب‌اپلیکیشن **مختص آیفون (iPhone-Only Native PWA)** با ظاهر شیشه‌ای مایع (Liquid Glass)، شکست نور، لبه‌های براق (Specular Rim Highlights) و انیمیشن‌های فنری ۶۰ فریم بر ثانیه مشابه اپ‌های نیتیو iOS.

من از این وب‌اپ **فقط روی آیفون** استفاده می‌کنم؛ بنابراین تمام لایه‌های دسکتاپ (مثل سایدبار سمت راست دسکتاپ) را حذف کن و کل تجربه کاربری را روی ابعاد آیفون (`max-width: 430px` و `100dvh`) با رعایت کامل `safe-area-inset` (برای Dynamic Island و نوار پایین آیفون) متمرکز کن.

### ۱. پیاده‌سازی سیستم متریال ۳ لایه Liquid Glass اپل
به‌جای کارت‌های تیره و مات معمولی یا یک `backdrop-filter: blur` ساده، معماری ۳ لایه شیشه مایع اپل را در CSS پیاده‌سازی کن:
1. **پس‌زمینه زنده محیطی (Ambient Mesh Underlay):** شیشه فقط زمانی واقعی دیده می‌شود که نور و رنگ در پس‌زمینه آن جریان داشته باشد. یک لایه ثابت (`position: fixed; inset: 0; z-index: -1`) با پس‌زمینه مشکی عمیق OLED (`#03070E`) و گوی‌های نوری محو (`blur(95px)`) به رنگ‌های فیروزه‌ای (`#06B6D4`)، سرخابی/بنفش (`#EC4899` / `#6366F1`) و سبز زمردی (`#10B981`) بساز تا هنگام اسکرول کارت‌ها، شکست رنگ از پشت شیشه دیده شود.
2. **فیلتر شکست نور SVG (`#ios-liquid-glass`):** یک فیلتر `<svg>` مخفی با `feTurbulence` و `feDisplacementMap` بساز و روی داک شناور پایین و کپسول‌های کنترلی اعمال کن تا انحنای نور در لبه‌های شیشه شبیه‌سازی شود.
3. **لبه‌های براق و درخشش داخلی (Specular Rim & Inner Glow):**
   - برای تمام کارت‌ها (`.ios-glass-card`): از `backdrop-filter: blur(28px) saturate(190%) brightness(1.05)`، گرادینت نیمه‌شفاف (`rgba(255,255,255,0.09)` به `0.03`)، شعاع انحنای `28px` (اسکوارکل اپل) و سایه داخلی چندلایه (`box-shadow: inset 0 1px 0.5px rgba(255,255,255,0.38), inset 1px 0 0.5px rgba(255,255,255,0.15), 0 14px 34px -10px rgba(0,0,0,0.55)`) استفاده کن.
   - برای باکس‌های داخلی داخل کارت‌های هیرو (`.ios-glass-subtile`): از شیشه تیره فرورفته (`rgba(0,0,0,0.22)` با بوردر نازک `rgba(255,255,255,0.09)`) استفاده کن تا شلوغی بصری ایجاد نشود.

### ۲. بازطراحی کامپوننت‌ها و صفحات پروژه
1. **هدر iOS Large Title:**
   - در حالت عادی عنوان بزرگ و بولد (`ورودی`، `رادار شغلی`، `جستجو`، `نشان‌شده`، `تنظیمات`) در سمت راست با زیرعنوان فیروزه‌ای (`Knowledge & Opportunity Hub` / `امتیازدهی هوشمند فرصت‌ها`) و دکمه شیشه‌ای گرد/کپسولی (`به‌روزرسانی` یا `بیشترین تطابق`) در سمت چپ.
   - هنگام اسکرول به پایین، هدر به یک نوار شیشه‌ای فشرده و چسبان (Sticky Blurred Navbar) در بالای صفحه تبدیل شود.
2. **کارت هیرو در صفحه «ورودی» (`خلاصه هوشمند امروز`):**
   - کارت شیشه‌ای با هاله نوری بنفش-سرخابی در گوشه چپ بالا و بج شیشه‌ای براق `✨ خلاصه هوشمند امروز`.
   - نمایش عدد بزرگ `۱۰ مورد خوانده‌نشده` با افکت متالیک-شیشه‌ای در راست و دو باکس شیشه‌ای `۲ شغل پرتطابق` (سبز نئونی) و `۳ خبر تازه` (زرد کهربایی) در چپ.
   - دو ردیف خلاصه خبر و شغل در پایین کارت با خط عمودی نئونی درخشان در سمت راست هر ردیف.
3. **کارت هیرو در صفحه «رادار شغلی»:**
   - هاله نوری راداری سبز زمردی در پس‌زمینه کارت، نمایش درشت `۷۲٪ میانگین تطابق با پروفایل شما`، سه باکس آمار شیشه‌ای (`۱ ذخیره‌شده`، `۱ ارسال رزومه`، `۱ مصاحبه`) و ردیف اسکرول افقی تگ‌های مهارت (`React`, `TypeScript`, `Python`, `FastAPI`, `PWA`, `Tailwind`) با کپسول‌های شیشه‌ای سبز-فیروزه‌ای.
4. **کپسول‌های فیلتر افقی (Filter Pills):**
   - اسکرول افقی بدون اسکرول‌بار. کپسول فعال (`همه ۱۲` یا `همه ۵`) به‌جای رنگ تخت، از **شیشه رنگی درخشان (Tinted Liquid Glass)** با گرادینت فیروزه‌ای نیمه‌شفاف، لبه‌های براق سفید و سایه نوری فیروزه‌ای استفاده کند.
5. **کارت‌های فید و آگهی شغلی:**
   - بج منبع شیشه‌ای (`TechCrunch` طلایی، `RemoteOK` سبز زمردی) + نقطه آبی درخشان آیتم خوانده‌نشده.
   - نمودار دایره‌ای درصد تطابق (`۹۲`) با حلقه SVG نئونی درخشان (`drop-shadow` سبز زمردی).
   - پشتیبانی از ژست حرکتی کشیدن به راست (نشان کردن) و کشیدن به چپ (آرشیو) با فیزیک فنری iOS.
6. **داک شناور کپسولی پایین صفحه (iOS 26 Floating Liquid Glass Tab Bar):**
   - یک کپسول شیشه‌ای کاملاً شناور در پایین صفحه (`bottom: calc(env(safe-area-inset-bottom) + 10px)`) با فاصله از لبه‌های چپ و راست، بلور بسیار بالا (`blur(36px) saturate(210%)`) و لبه بالایی براق که کارت‌های صفحه هنگام اسکرول از پشت آن عبور کنند و نورشان شکسته شود.
   - تب فعال (`ورودی`، `رادار شغلی`، `جستجو`، `نشان‌شده`، `تنظیمات`) دارای یک کپسول عدسی شیشه‌ای فیروزه‌ای باشد که با انیمیشن فنری بین تب‌ها حرکت کند، به همراه بج‌های اعلان قرمز براق iOS (`۵` و `۲`).
7. **باتم‌شیت نیتیو جزئیات آگهی و حالت مطالعه (`حالت مطالعه تمیز`):**
   - باز شدن از پایین با انیمیشن فنری (`cubic-bezier(0.32, 0.72, 0, 1)`) به همراه کوچک شدن ظریف صفحه پشتی (`scale(0.95)`) دقیقاً مثل شیت‌های نیتیو iOS.
   - دستگیره بالای شیت (Grabber Pill)، کارت شیشه‌ای `✨ تحلیل هوش مصنوعی` با گیج دایره‌ای `۹۲ درصد تطابق`، سه کارت متادیتای شیشه‌ای (`دورکاری`، `Berlin, DE`، `$85k – $110k`)، کپسول‌های شیشه‌ای تغییر `وضعیت درخواست` (`جدید`، `ذخیره‌شده`، `ارسال رزومه`، `مصاحبه`، `رد شده`) و تگ‌های شیشه‌ای نیازمندی‌ها.

### ۳. قواعد فنی و تعاملی
- تمام متن‌های فارسی با فونت `Vazirmatn` و متون انگلیسی و اعداد لاتین با فونت سیستم اپل (`-apple-system, SF Pro Display`) رندر شوند.
- روی تمام دکمه‌ها و کارت‌ها افکت لمسی نیتیو (`active:scale-[0.96]`) و حذف هایلایت آبی مرورگر (`-webkit-tap-highlight-color: transparent`) اعمال شود.
- هیچ بخشی از منطق برنامه، دیتا یا فیلترهای فعلی حذف نشود و صرفاً پوسته، لایه‌بندی و استایل‌ها به سطح یک اپ نیتیو iOS 26 ارتقا یابد.

````

## ۳. جدول خلاصه ویژگی‌های کلیدی لحاظ‌شده در پرامپت

| بخش رابط کاربری | تغییر اعمال‌شده در پرامپت برای تجربه Native iOS 26 | 
| ----- | ----- | 
| **پوسته و Viewport** | حذف کامل لایه‌های دسکتاپ، قفل روی ابعاد آیفون (`100dvh`)، تنظیم متاتگ‌های PWA و رعایت `safe-area-inset` برای Dynamic Island و Home Indicator | 
| **متریال Liquid Glass** | معماری ۳ لایه اپل شامل فیلتر شکست نور SVG (`#ios-liquid-glass`)، بلور اشباع‌شده (`blur(28px) saturate(190%)`) و لبه‌های براق نوری (`inset box-shadow`) | 
| **پس‌زمینه نوری پویا** | افزودن گوی‌های نوری محو (Ambient Mesh Orbs) در پس‌زمینه ثابت تا هنگام اسکرول کارت‌ها، شکست رنگ واقعی از پشت شیشه دیده شود | 
| **کارت‌های هیرو و فید** | طراحی مجدد کارت `خلاصه هوشمند امروز`، گیج دایره‌ای نئونی `۹۲٪` در `رادار شغلی` و پشتیبانی از سوایپ چپ/راست با فیزیک فنری | 
| **داک شناور پایین (Tab Bar)** | تبدیل نوار پایین به کپسول شناور شیشه‌ای iOS 26 با عدسی متحرک تب فعال و عبور محتوای صفحه از زیر داک هنگام اسکرول | 
| **باتم‌شیت جزئیات (Sheet)** | شیت نیتیو iOS با افکت عقب رفتن صفحه پشتی (`scale(0.95)`)، کارت شیشه‌ای `تحلیل هوش مصنوعی` و کپسول‌های شیشه‌ای وضعیت درخواست | 

## ۴. پرامپت فاز ۲: رفع باگ‌های ظاهری و پولیش نهایی نسخه `/t` (Follow-Up Polish Prompt)

بر اساس بررسی زنده نسخه [radar.salehi.my/t](https://radar.salehi.my/t)، ساختار اصلی شیشه‌ای، فریم آیفون، داک شناور و باتم‌شیت بسیار خوب پیاده‌سازی شده‌اند؛ اما ۷ باگ ظاهری و جزئیات نیتیو باقی مانده‌اند. برای رفع کامل آن‌ها، این پرامپت تکمیلی را به ایجنت کدنویسی خود بدهید:

```markdown
# Phase 2: UI/UX Bug Fixes & Native iOS 26 Liquid Glass Polish (`/t` Route)

Great job on the initial iOS Liquid Glass layout! After inspecting the live build at `https://radar.salehi.my/t`, please fix the following 7 specific UI/RTL bugs and apply the final iOS 26 material polish:

1. **Fix Broken Icon Glyphs / Encoding (`???` / `[?]`):**
   - In the main page title/header (e.g., next to `صندوق ورودی جامع`) and some menu/badge items, emojis or icon characters are rendering as broken `???` or missing glyph boxes.
   - Replace any corrupted character literals with clean inline SVG icons (Lucide React / SF-style SVG icons) or properly UTF-8 encoded emojis.

2. **Standardize RTL Percentage Formatting (`٪`):**
   - Currently, match percentages are inconsistent across the UI: the hero banner shows `% ۹۸` (percent on the left), job cards show `۹۹%` (Latin percent), and AI analysis text shows `(۹۹٪)`.
   - Unify all percentages across the entire app using the Persian percent sign on the right side in RTL order (`۹۸٪`, `۹۹٪`, `۷۲٪`) or wrap numeric badges consistently so the symbol never jumps sides.

3. **Fix Text Truncation in Header & Filter Pills (`پروداکت ...` & `ویترین هوش من...`):**
   - On the Product Hunt tab (`پروداکت`), the header title truncates awkwardly as `پروداکت ...`. Allow the header title to display cleanly or adjust its font size (`clamp(1.35rem, 5vw, 1.85rem)`).
   - In horizontal filter chip bars, pills like `ویترین هوش مصنوعی و اتوماسیون` are getting cut off (`ویترین هوش من...`). Add `flex-shrink: 0; white-space: nowrap;` to every filter pill inside the `overflow-x: auto` container so pills never squash or truncate.

4. **Fix Double Hashtags in Search Tag Cloud (`#دورکاری#`):**
   - In the Search tab (`جستجو`), tag chips are rendering with duplicate `#` symbols on both ends (e.g., `#دورکاری#`, `#تهران#`).
   - Strip any leading/trailing `#` from the tag string before prepending a single `#` (e.g., `` `#${tag.replace(/^#+|#+$/g, '')}` ``) and ensure correct RTL direction.

5. **Fix Bottom Floating Dock Overlap & Crowding:**
   - The floating bottom dock currently has 7 tabs crammed together, and at the bottom of long views (like `تنظیمات` or the bottom of the job feed), the dock covers the last action buttons/cards.
   - Add `padding-bottom: calc(env(safe-area-inset-bottom) + 120px)` to the main scrollable view container so the final card and the `ذخیره تغییرات پروفایل` button can scroll completely above the floating dock.
   - Make the 7-tab dock either horizontally scrollable with smooth snap or consolidate secondary tabs (`پروداکت` and `پروژه`) so the 5 main iPhone tabs (`ورودی`, `رادار شغلی`, `جستجو`, `نشان‌شده`, `تنظیمات`) have generous breathing room and never truncate labels.

6. **Unify Filter Pill Dot Indicator Alignment:**
   - In the Inbox filter bar, the small status dot inside the `همه` pill appears on the left of the text, whereas in `تلگرام` and `فرصت‌های شغلی` it appears on the right.
   - Enforce a unified `display: inline-flex; align-items: center; gap: 6px; flex-direction: row;` across all filter pills so the indicator dot always sits in the exact same relative position.

7. **Replace Empty Skeleton Boxes in Product Hunt Tab with a Glass Empty State:**
   - When Product Hunt digest items are empty or not yet loaded, static gray skeleton boxes remain stuck on screen.
   - If loading is complete and items are empty, render a sleek `.ios-glass-card` Empty State with an icon, short Persian explanation, and a glowing Liquid Glass CTA button (`دریافت مجدد دایجست ۲۴ ساعت`).

8. **Enhance True Specular Rim Highlights & Touch Physics:**
   - Increase the top specular rim highlight on `.ios-glass-card`, `.ios-glass-dock`, and the Bottom Sheet using `box-shadow: inset 0 1.5px 0.5px 0 rgba(255, 255, 255, 0.42), inset 0 -1px 0.5px 0 rgba(255, 255, 255, 0.08)` and `backdrop-filter: blur(32px) saturate(200%)`.
   - Ensure the Bottom Sheet grab handle supports touch drag-to-dismiss (`onTouchStart` / `onTouchMove` / `onTouchEnd`) and scales down the background container (`scale(0.95)`) when open.
```
