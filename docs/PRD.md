# ScrollTail — Product Requirements Document

**Version:** 1.5  
**Dato:** 12. marts 2026  
**Projekt:** ScrollTail  
**Ejer:** Moiré  
**Status:** Draft

---

## 1. Oversigt

ScrollTail er et **letvægts scroll-detection bibliotek** til HTML5 display bannere — primært Tumult Hype.

**Opgavefordeling:**

| Ansvar | Hvem |
|---|---|
| Design, bevægelse, timeline-animationer | Hype |
| Scroll-detection (hvornår starter animationen) | ScrollTail |
| Selve animationen (tweens, easing, timing) | GSAP |

ScrollTail gør præcis én ting: den lytter på scroll og fortæller GSAP hvornår den skal starte.

```
Bruger scroller → IntersectionObserver fyrer → GSAP starter
```

---

## 2. Kernekoncept

Et element med en `st-*` animationsklasse scroll-triggers automatisk når det ses i viewport. Ingen trigger-klasse kræves — det er default.

**Minimum brugsscenarie:**
```html
<div class="st-fade-up">Tekst</div>
```

**Med parametre:**
```html
<div class="st-fade-up st-dur-600 st-ease-spring st-delay-200">Tekst</div>
```

**Sekventiel animation (GSAP timeline):**  
Elementer med `st-order-*` samles automatisk i én GSAP timeline og kører sekventielt. Tidslinjen trigger når det første element (laveste `st-order-*`) scrolles ind.

```html
<div class="st-fade-up st-order-1">Overskrift</div>
<div class="st-fade-up st-order-2">Underoverskrift</div>
<div class="st-scale   st-order-3 st-delay-200">CTA</div>
```

---

## 3. Mål

- En designer kan scroll-triggere et element uden at skrive JavaScript
- Minimum brugsscenarie er én klasse: `st-fade-up`
- `scrolltail.min.js` er < 3 KB gzipped
- Fungerer i iframes uden adgang til parent-sidens scroll
- Fungerer i alle gængse HTML5 banner-miljøer (Hype, Adform, Bannersnack, Celtra)

---

## 4. Teknisk fundament

### 4.1 Vægtbudget

| Platform | Initial load limit |
|---|---|
| Google Campaign Manager | 150 KB |
| Adform | 150 KB |
| Bannersnack / Celtra | 200 KB |

**ScrollTail's fodaftryk:**

| Fil | Størrelse (min+gzip) | Hvornår |
|---|---|---|
| `gsap.min.js` | ~30 KB | Altid |
| `scrolltail.min.js` | < 3 KB | Altid |
| `ScrollTrigger.min.js` | ~28 KB | Kun ved `st-scroll` / `st-parallax-*` |

Normalt scenarie: **~33 KB total**.

### 4.2 Scroll-detektion

ScrollTail bruger tre metoder afhængigt af kontekst. Alt er automatisk — designeren behøver ikke vide hvilken der bruges.

**IntersectionObserver** (browser-native, nul ekstra vægt):
- Default trigger og `st-repeat` — benytter in/out-signal
- `st-scroll` i iframe-kontekst — benytter `intersectionRatio` (0→1) som scroll-proxy

**IntersectionObserver ratio som scroll-proxy:**  
Når banneret kører i en iframe (Google, Adform, Bannersnack) kan `st-scroll` ikke tilgå parent-sidens `scrollY`. I stedet bruges `intersectionRatio` — et tal fra 0 til 1 der beskriver, hvor stor en del af banneret der er synligt. Dette tal scrubbes direkte ind i GSAP's timeline som animation-progress:

```
Banner 0% synligt  → ratio = 0.0 → animation at start
Banner 50% synligt → ratio = 0.5 → animation halvvejs
Banner 100% synligt → ratio = 1.0 → animation færdig
Scroll op           → ratio falder → animation kører baglæns
```

Dette giver en naturlig scroll-fornemmelse i alle banner-miljøer — uden at publisher-siden behøver nogen opsætning.

**GSAP ScrollTrigger** (kun ved behov, +28 KB):
- `st-scroll` uden for iframe — præcis pixel-for-pixel scroll-binding
- `st-parallax-*` — parallax-effekter

**Automatisk kontekst-detection:**

| Kontekst | `st-scroll` bruger |
|---|---|
| Ikke i iframe (selvhostet side) | GSAP ScrollTrigger — pixel-perfekt |
| I iframe (Google, Adform, Bannersnack) | IntersectionObserver ratio — virker overalt |
| Publisher sender postMessage scroll (v1.1) | Præcist scrollY fra parent |

### 4.3 Script-setup

**Minimum — ~33 KB:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/moire/ScrollTail@1.0/dist/scrolltail.min.js"></script>
```

**Med `st-scroll` uden for iframe (selvhostet) — ~61 KB:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/moire/ScrollTail@1.0/dist/scrolltail.min.js"></script>
```

> **Bemærk:** `st-scroll` virker i iframes uden ScrollTrigger via IntersectionObserver ratio. ScrollTrigger er kun nødvendig for pixel-perfekt scroll-binding på selvhostede sider.

### 4.4 Arkitektur

```
scrolltail.js  (<3 KB)
│
├── init()
│   ├── Tjekker at window.gsap er tilgængeligt
│   ├── Detekterer iframe-kontekst (window.self !== window.top)
│   ├── Scanner DOM for elementer med st-* klasser
│   ├── Finder elementer med st-order-* og bygger GSAP timelines
│   └── Sætter IntersectionObserver per element eller timeline
│
├── parseClasses(el)
│   └── Returnerer config: { type, dist, dur, delay, ease, order, repeat, scroll, parallax, visible }
│
├── buildTimeline(elements)
│   ├── Sorterer efter st-order-*
│   ├── Bygger gsap.timeline({ paused: true })
│   └── Trigger via IntersectionObserver på første element i sekvensen
│
├── buildSingle(el, config)
│   └── Bygger gsap.from() tween, trigger via IntersectionObserver
│
├── buildScrollScrub(el, config)
│   ├── I iframe: IntersectionObserver med threshold-array [0…1]
│   │   → mapper intersectionRatio til gsap.timeline progress
│   └── Uden for iframe + ScrollTrigger tilgængeligt: GSAP ScrollTrigger
│
└── ScrollTail (global API)
    ├── refresh()
    ├── pause()
    ├── resume()
    └── destroy()
```

### 4.5 Timeline og delay

Elementer med `st-order-*` kører sekventielt i en GSAP timeline:
- Default: hvert element starter når det forrige er færdigt
- `st-delay-200` på et element: `"+=0.2"` position i tidslinjen — 200ms ekstra pause
- Trigger: IntersectionObserver på det element med laveste `st-order-*`

```javascript
const tl = gsap.timeline();
tl.from(el1, { opacity: 0, y: 40, duration: 0.6, ease: "power2.out" })
  .from(el2, { opacity: 0, y: 40, duration: 0.6, ease: "power2.out" })
  .from(el3, { opacity: 0, y: 40, duration: 0.6, ease: "elastic.out(1, 0.5)" }, "+=0.2")
```

---

## 5. Klasser — komplet reference

### 5.1 Animationstyper

Vælg én. Elementet scroll-triggers automatisk.

| Klasse | GSAP fra-state | Beskrivelse |
|---|---|---|
| `st-fade` | `opacity: 0` | Fade ind |
| `st-fade-up` | `opacity: 0, y: dist` | Fade op nedefra |
| `st-fade-down` | `opacity: 0, y: -dist` | Fade ned ovenfra |
| `st-fade-left` | `opacity: 0, x: dist` | Fade ind fra højre |
| `st-fade-right` | `opacity: 0, x: -dist` | Fade ind fra venstre |
| `st-slide-left` | `x: dist` | Slide ind fra højre — ingen fade |
| `st-slide-right` | `x: -dist` | Slide ind fra venstre — ingen fade |
| `st-scale` | `scale: 0, opacity: 0` | Skaler ind fra 0 |
| `st-rotate` | `rotation: -15, opacity: 0` | Rotér ind fra -15deg |
| `st-blur` | `filter: blur(12px), opacity: 0` | Fade ind fra sløret til skarp |

### 5.2 Distance

| Klasse | Værdi |
|---|---|
| `st-dist-sm` | 20px |
| `st-dist-md` | 40px (standard) |
| `st-dist-lg` | 80px |
| `st-dist-xl` | 120px |

### 5.3 Duration

| Klasse | Varighed |
|---|---|
| `st-dur-300` | 300ms |
| `st-dur-600` | 600ms (standard) |
| `st-dur-1000` | 1000ms |
| `st-dur-1600` | 1600ms |

### 5.4 Delay

På individuelle elementer: forsinkelse inden animationen starter.  
På elementer med `st-order-*`: ekstra pause efter forrige element i tidslinjen.

| Klasse | Værdi |
|---|---|
| `st-delay-0` | 0ms |
| `st-delay-100` | 100ms |
| `st-delay-200` | 200ms |
| `st-delay-300` | 300ms |
| `st-delay-400` | 400ms |
| `st-delay-500` | 500ms |
| `st-delay-750` | 750ms |
| `st-delay-1000` | 1000ms |

### 5.5 Easing

| Klasse | GSAP ease |
|---|---|
| `st-ease-linear` | `none` |
| `st-ease-in` | `power2.in` |
| `st-ease-out` | `power2.out` (standard) |
| `st-ease-in-out` | `power2.inOut` |
| `st-ease-bounce` | `back.out(1.7)` |
| `st-ease-spring` | `elastic.out(1, 0.5)` |

### 5.6 Rækkefølge (sekventiel animation)

Elementer med `st-order-*` samles i én GSAP timeline og kører sekventielt.  
Trigger: når det element med laveste ordenstal scrolles ind i viewport.

| Klasse | Beskrivelse |
|---|---|
| `st-order-1` | Første i sekvensen — starter tidslinjen |
| `st-order-2` | Starter når order-1 er færdig |
| `st-order-3` | Starter når order-2 er færdig |
| `st-order-4` | Starter når order-3 er færdig |
| `st-order-5` | Starter når order-4 er færdig |
| `st-order-6` | Starter når order-5 er færdig |

Tilføj `st-delay-*` for ekstra pause inden et bestemt element.

### 5.7 Scroll-adfærd

Sættes kun når man afviger fra default.

| Klasse | Beskrivelse |
|---|---|
| *(ingen)* | Trigger én gang når elementet ses |
| `st-repeat` | Trigger igen ved hvert scroll ind/ud |
| `st-scroll` | Bind animation til scroll-position — kører frem og tilbage |

**`st-scroll` virker i alle banner-miljøer:**

| Miljø | Metode |
|---|---|
| Google Campaign Manager | IntersectionObserver ratio |
| Adform | IntersectionObserver ratio |
| Bannersnack / Celtra | IntersectionObserver ratio |
| Selvhostet (ikke iframe) | GSAP ScrollTrigger (hvis tilgængeligt) |

### 5.8 Visibility threshold

| Klasse | Synlig andel |
|---|---|
| `st-visible-0` | 0% — trigger ved kanten |
| `st-visible-25` | 25% |
| `st-visible-50` | 50% (standard) |
| `st-visible-75` | 75% |

### 5.9 Parallax

Kræver `st-scroll` og GSAP ScrollTrigger.

| Klasse | Effekt |
|---|---|
| `st-parallax-slow` | Langsommere end scroll |
| `st-parallax-med` | Halvt tempo |
| `st-parallax-fast` | Hurtigere end scroll |
| `st-parallax-reverse` | Modsat retning |

---

## 6. Data-attributter

| Attribut | Eksempel | Beskrivelse |
|---|---|---|
| `data-st-scroller` | `data-st-scroller="#banner-wrap"` | Custom scroll-container |
| `data-st-start` | `data-st-start="top 80%"` | ScrollTrigger `start` (kun ved `st-scroll`) |
| `data-st-end` | `data-st-end="bottom 20%"` | ScrollTrigger `end` (kun ved `st-scroll`) |

---

## 7. Public JavaScript API

```javascript
ScrollTail.refresh();        // Genscanner DOM
ScrollTail.pause();          // Pauser alle observers og triggers
ScrollTail.resume();         // Genaktiverer
ScrollTail.destroy();        // Rydder alt — brug ved scene-cleanup i Hype
ScrollTail.setScroller(sel); // Sæt custom scroll-container
```

---

## 8. Fallback-adfærd

| Situation | Adfærd |
|---|---|
| GSAP ikke loadet | Elementer vises i slutstate, ingen animation |
| ScrollTrigger mangler, men `st-scroll` bruges | Console-advarsel; fallback til default trigger |
| IntersectionObserver ikke understøttet | Elementer vises i slutstate |
| `prefers-reduced-motion` aktiv | Alle animationer deaktiveres |

---

## 9. Integration i Tumult Hype

### Trin 1 — Head HTML
`Document Inspector → Head HTML`:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/moire/ScrollTail@1.0/dist/scrolltail.min.js"></script>
```

### Trin 2 — Klasser på elementer
`Element Inspector → Additional HTML Attributes → class`:

```
st-fade-up st-dur-600 st-ease-spring st-delay-200
```

### Trin 3 — Scene cleanup (anbefalet)
I Hype's "On Scene Unload"-funktion:

```javascript
ScrollTail.destroy();
```

---

## 10. Eksempel: Banner-scene med sekventiel animation

| Element | class |
|---|---|
| Overskrift | `st-fade-up st-dist-lg st-dur-1000 st-ease-spring st-order-1` |
| Underoverskrift | `st-fade-up st-dist-md st-dur-600 st-ease-out st-order-2` |
| Fordel 1 | `st-fade-right st-dist-sm st-dur-300 st-ease-bounce st-order-3` |
| Fordel 2 | `st-fade-right st-dist-sm st-dur-300 st-ease-bounce st-order-4` |
| Fordel 3 | `st-fade-right st-dist-sm st-dur-300 st-ease-bounce st-order-5` |
| CTA-knap | `st-scale st-dur-600 st-ease-spring st-order-6 st-delay-200` |

ScrollTail bygger automatisk én GSAP timeline. Trigger når overskriften (order-1) scrolles ind.

---

## 11. Ikke-funktionelle krav

| Krav | Mål |
|---|---|
| `scrolltail.min.js` størrelse | < 3 KB gzipped |
| GSAP-afhængighed | GSAP 3.x (peer dependency) |
| ScrollTrigger-afhængighed | Valgfri — kun ved `st-scroll` / `st-parallax-*` |
| Browserunderstøttelse | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| Iframe-support | IntersectionObserver virker cross-iframe |
| `prefers-reduced-motion` | Deaktiveres automatisk |
| Init-strategi | Auto-init ved DOMContentLoaded |

---

## 12. Out of scope (v1.0)

- Horisontal scroll
- Video-scroll-scrubbing
- SVG path-animation
- Lottie-integration
- postMessage scroll-bridge til publisher-side
- GUI / visuelt konfigurationsværktøj

---

## 13. Filstruktur

```
ScrollTail/
├── docs/
│   ├── PRD.md
│   └── CHEATSHEET.md
├── src/
│   └── scrolltail.js
├── dist/
│   ├── scrolltail.min.js
│   └── scrolltail.min.js.map
├── examples/
│   ├── basic-banner.html
│   ├── sequence-banner.html
│   └── parallax-banner.html
├── README.md
├── package.json
└── vite.config.js
```

---

## 14. Roadmap

| Version | Indhold |
|---|---|
| **v1.0** | Alle klasser, IntersectionObserver, GSAP timeline, `st-scroll` med ratio-fallback i iframes |
| **v1.1** | postMessage scroll-bridge (præcist scrollY fra publisher), named groups |
| **v1.2** | Horisontal scroll |
| **v2.0** | Hype-extension, GUI-preview |
